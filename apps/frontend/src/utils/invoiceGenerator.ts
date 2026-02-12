import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface InvoiceData {
    order: {
        id: string;
        createdAt: string;
        total: number;
        paymentMethod: string;
        status: string;
    };
    user: {
        name: string;
        email: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        selectedColor?: string;
    }>;
    address?: {
        street: string;
        number: string;
        city: string;
        state: string;
        zipCode: string;
    };
    payment?: {
        qrCode?: string;
        barcode?: string;
    };
}

export const generateInvoicePDF = (data: InvoiceData): void => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('VANTAGE', 20, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Loja de Produtos Premium', 20, 27);
    doc.text('CNPJ: 00.000.000/0001-00', 20, 32);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FATURA / NOTA FISCAL', pageWidth - 20, 20, { align: 'right' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nº ${data.order.id.slice(0, 8).toUpperCase()}`, pageWidth - 20, 27, { align: 'right' });
    doc.text(`Data: ${new Date(data.order.createdAt).toLocaleDateString('pt-BR')}`, pageWidth - 20, 32, { align: 'right' });

    doc.setLineWidth(0.5);
    doc.line(20, 40, pageWidth - 20, 40);

    let yPos = 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE', 20, yPos);

    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${data.user.name}`, 20, yPos);
    yPos += 5;
    doc.text(`E-mail: ${data.user.email}`, 20, yPos);

    if (data.address) {
        yPos += 5;
        doc.text(`Endereço: ${data.address.street}, ${data.address.number}`, 20, yPos);
        yPos += 5;
        doc.text(`${data.address.city} - ${data.address.state}, CEP: ${data.address.zipCode}`, 20, yPos);
    }

    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ITENS DO PEDIDO', 20, yPos);

    yPos += 5;
    const tableData = data.items.map(item => [
        item.name + (item.selectedColor ? ` (${item.selectedColor})` : ''),
        item.quantity.toString(),
        `R$ ${item.price.toFixed(2)}`,
        `R$ ${(item.quantity * item.price).toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Produto', 'Qtd', 'Preço Unit.', 'Total']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [24, 24, 27], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 35, halign: 'right' }
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY || yPos + 40;

    yPos = finalY + 10;
    const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const shipping = 15.90;
    const total = data.order.total;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const rightAlign = pageWidth - 20;
    doc.text(`Subtotal:`, rightAlign - 40, yPos, { align: 'right' });
    doc.text(`R$ ${subtotal.toFixed(2)}`, rightAlign, yPos, { align: 'right' });

    yPos += 6;
    doc.text(`Frete:`, rightAlign - 40, yPos, { align: 'right' });
    doc.text(`R$ ${shipping.toFixed(2)}`, rightAlign, yPos, { align: 'right' });

    yPos += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL:`, rightAlign - 40, yPos, { align: 'right' });
    doc.text(`R$ ${total.toFixed(2)}`, rightAlign, yPos, { align: 'right' });

    yPos += 15;
    doc.setFontSize(11);
    doc.text('INFORMAÇÕES DE PAGAMENTO', 20, yPos);

    yPos += 7;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const paymentMethodText = {
        'pix': 'PIX',
        'card': 'Cartão de Crédito',
        'boleto': 'Boleto Bancário'
    }[data.order.paymentMethod.toLowerCase()] || data.order.paymentMethod;

    doc.text(`Método: ${paymentMethodText}`, 20, yPos);
    yPos += 5;
    doc.text(`Status: ${data.order.status === 'PAID' ? 'Pago' : data.order.status === 'PENDING' ? 'Aguardando Pagamento' : data.order.status}`, 20, yPos);

    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Obrigado pela sua compra!', pageWidth / 2, footerY, { align: 'center' });
    doc.text('VANTAGE - Produtos Premium | contato@vantage.com.br', pageWidth / 2, footerY + 4, { align: 'center' });

    const fileName = `Fatura_${data.order.id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};

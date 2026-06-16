package com.store.domain.sale;

public enum InvoiceType {
    A, // Inscripto a Inscripto (Discrimina IVA)
    B, // Inscripto a Consumidor Final (IVA incluido)
    C, // Monotributista (Sin IVA)
    TICKET_NO_FISCAL // Comprobante interno
}

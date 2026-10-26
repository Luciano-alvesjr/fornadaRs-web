package com.fornada.fornadars.Produto.Pedido;

import jakarta.validation.constraints.NotNull;

public record StatusPedidoRequest(@NotNull StatusPedido status) {
}

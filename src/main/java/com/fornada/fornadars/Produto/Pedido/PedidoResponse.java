package com.fornada.fornadars.Produto.Pedido;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(Long id, LocalDateTime data, StatusPedido status,
                             List<ItemResponse> itens, BigDecimal total) {
    public static PedidoResponse de(PedidoEntity pedido) {
        var itens = pedido.getItens().stream().map(item -> new ItemResponse(
                item.getProduto().getId(), item.getProduto().getNome(),
                item.getQuantidade(), item.getPrecoUnitario(), item.getSubtotal())).toList();
        return new PedidoResponse(pedido.getId(), pedido.getData(), pedido.getStatus(),
                itens, pedido.getTotal());
    }

    public record ItemResponse(Long produtoId, String nomeProduto, Integer quantidade,
                               BigDecimal precoUnitario, BigDecimal subtotal) {
    }
}

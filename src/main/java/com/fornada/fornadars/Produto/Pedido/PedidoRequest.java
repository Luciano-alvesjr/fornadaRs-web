package com.fornada.fornadars.Produto.Pedido;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public record PedidoRequest(
        @NotEmpty @Size(max = 100) List<@NotNull @Valid ItemRequest> itens) {
    public record ItemRequest(
            @NotNull @Positive Long produtoId,
            @NotNull @Min(1) @Max(10000) Integer quantidade) {
    }
}

package com.fornada.fornadars.Produto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProdutoRequest(
        @NotBlank @Size(max = 120) String nome,
        @NotNull @Positive @Digits(integer = 10, fraction = 2) BigDecimal preco) {
}

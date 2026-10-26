package com.fornada.fornadars.Produto.Pedido;

import com.fornada.fornadars.Produto.ProdutoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PedidoService {
    private final PedidoRepository repository;
    private final ProdutoService produtoService;

    public List<PedidoResponse> listar() {
        return repository.findAll().stream().map(PedidoResponse::de).toList();
    }

    public PedidoResponse buscar(Long id) {
        return PedidoResponse.de(buscarEntity(id));
    }

    @Transactional
    public PedidoResponse cadastrar(PedidoRequest dados) {
        PedidoEntity pedido = new PedidoEntity();
        for (var entrada : dados.itens()) {
            var produto = produtoService.buscar(entrada.produtoId());
            ItemPedidoEntity item = new ItemPedidoEntity();
            item.setProduto(produto);
            item.setQuantidade(entrada.quantidade());
            // Guarda o preço da compra, mesmo se o produto mudar de preço depois.
            item.setPrecoUnitario(produto.getPreco());
            pedido.adicionarItem(item);
        }
        return PedidoResponse.de(repository.save(pedido));
    }

    @Transactional
    public PedidoResponse atualizarStatus(Long id, StatusPedido novoStatus) {
        PedidoEntity pedido = buscarEntity(id);
        StatusPedido atual = pedido.getStatus();
        boolean permitido = atual == novoStatus || switch (atual) {
            case RECEBIDO -> novoStatus == StatusPedido.EM_PREPARO || novoStatus == StatusPedido.CANCELADO;
            case EM_PREPARO -> novoStatus == StatusPedido.PRONTO || novoStatus == StatusPedido.CANCELADO;
            case PRONTO -> novoStatus == StatusPedido.ENTREGUE || novoStatus == StatusPedido.CANCELADO;
            case ENTREGUE, CANCELADO -> false;
        };
        if (!permitido) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transição de status não permitida");
        }
        pedido.setStatus(novoStatus);
        return PedidoResponse.de(pedido);
    }

    private PedidoEntity buscarEntity(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
    }
}

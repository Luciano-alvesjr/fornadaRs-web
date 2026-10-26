package com.fornada.fornadars.Produto;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProdutoService {
    private final ProdutoRepository repository;

    public List<ProdutoEntity> listar() {
        return repository.findAll();
    }

    public ProdutoEntity buscar(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));
    }

    @Transactional
    public ProdutoEntity cadastrar(ProdutoRequest dados) {
        ProdutoEntity produto = new ProdutoEntity();
        preencher(produto, dados);
        return repository.save(produto);
    }

    @Transactional
    public ProdutoEntity atualizar(Long id, ProdutoRequest dados) {
        ProdutoEntity produto = buscar(id);
        preencher(produto, dados);
        return repository.save(produto);
    }

    @Transactional
    public void excluir(Long id) {
        repository.delete(buscar(id));
        repository.flush();
    }

    private void preencher(ProdutoEntity produto, ProdutoRequest dados) {
        produto.setNome(dados.nome().trim());
        produto.setPreco(dados.preco());
    }
}

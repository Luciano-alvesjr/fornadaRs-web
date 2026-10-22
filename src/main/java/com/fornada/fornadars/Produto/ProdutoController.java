package com.fornada.fornadars.Produto;


import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/produtos)")
@RestController
@Valid


public class ProdutoController {

    public ProdutoController( ProdutoService produtoService) {

    }

}

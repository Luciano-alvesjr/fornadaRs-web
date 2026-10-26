package com.fornada.fornadars;

import com.fornada.fornadars.Produto.ProdutoRepository;
import com.fornada.fornadars.Produto.Pedido.PedidoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import java.net.URI;
import java.net.http.*;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class FornadarsWebApplicationTests {
    @Value("${local.server.port}")
    private int port;
    @Autowired private PedidoRepository pedidos;
    @Autowired private ProdutoRepository produtos;
    private final HttpClient client = HttpClient.newHttpClient();

    @BeforeEach
    void limpar() {
        pedidos.deleteAll();
        produtos.deleteAll();
    }

    @Test
    void produtoPodeSerCriadoConsultadoEditadoEExcluido() throws Exception {
        var criado = enviar("POST", "/produtos", "{\"nome\":\"Pao\",\"preco\":5.50}");
        assertEquals(201, criado.statusCode());
        long id = id(criado.body());
        assertTrue(criado.headers().firstValue("Location").orElseThrow().endsWith("/produtos/" + id));
        assertEquals(200, enviar("GET", "/produtos/" + id, null).statusCode());
        assertTrue(enviar("GET", "/produtos", null).body().contains("Pao"));
        var editado = enviar("PUT", "/produtos/" + id, "{\"nome\":\"Bolo\",\"preco\":10.00}");
        assertEquals(200, editado.statusCode());
        assertTrue(editado.body().contains("Bolo"));
        assertEquals(204, enviar("DELETE", "/produtos/" + id, null).statusCode());
        assertEquals(404, enviar("GET", "/produtos/" + id, null).statusCode());
    }

    @Test
    void validaDadosEIdentificadores() throws Exception {
        assertEquals(400, enviar("POST", "/produtos", "{\"nome\":\" \",\"preco\":-1}").statusCode());
        assertEquals(400, enviar("POST", "/produtos", "{\"nome\":\"Pao\",\"preco\":1.999}").statusCode());
        assertEquals(400, enviar("GET", "/produtos/abc", null).statusCode());
        assertEquals(400, enviar("POST", "/pedidos", "{\"itens\":[]}").statusCode());
        assertEquals(400, enviar("POST", "/pedidos", "{\"itens\":[null]}").statusCode());
        assertEquals(400, enviar("POST", "/pedidos",
                "{\"itens\":[{\"produtoId\":1,\"quantidade\":0}]}").statusCode());
        assertEquals(404, enviar("POST", "/pedidos",
                "{\"itens\":[{\"produtoId\":999999,\"quantidade\":1}]}").statusCode());
    }

    @Test
    void pedidoCalculaTotalPreservaPrecoEProtegeProdutoReferenciado() throws Exception {
        long produto1 = id(enviar("POST", "/produtos", "{\"nome\":\"Pao\",\"preco\":5.50}").body());
        long produto2 = id(enviar("POST", "/produtos", "{\"nome\":\"Bolo\",\"preco\":12.00}").body());
        var criado = enviar("POST", "/pedidos", "{\"itens\":[{\"produtoId\":" + produto1
                + ",\"quantidade\":2},{\"produtoId\":" + produto2 + ",\"quantidade\":1}]}");
        assertEquals(201, criado.statusCode());
        long pedido = id(criado.body());
        assertTrue(criado.body().contains("\"total\":23.00"), criado.body());
        assertEquals(200, enviar("PUT", "/produtos/" + produto1,
                "{\"nome\":\"Pao\",\"preco\":8.00}").statusCode());
        var consultado = enviar("GET", "/pedidos/" + pedido, null);
        assertEquals(200, consultado.statusCode());
        assertTrue(consultado.body().contains("\"total\":23.00"), consultado.body());
        assertTrue(enviar("GET", "/pedidos", null).body().contains("\"total\":23.00"));
        assertEquals(409, enviar("DELETE", "/produtos/" + produto1, null).statusCode());
        assertEquals(200, enviar("GET", "/produtos/" + produto1, null).statusCode());
    }

    @Test
    void statusSegueFluxoESomentePedidoAbertoPodeSerCancelado() throws Exception {
        long produto = id(enviar("POST", "/produtos", "{\"nome\":\"Pao\",\"preco\":5.50}").body());
        String dados = "{\"itens\":[{\"produtoId\":" + produto + ",\"quantidade\":1}]}";
        long pedido = id(enviar("POST", "/pedidos", dados).body());
        assertEquals(409, status(pedido, "ENTREGUE").statusCode());
        assertEquals(200, status(pedido, "EM_PREPARO").statusCode());
        assertEquals(200, status(pedido, "PRONTO").statusCode());
        assertEquals(200, status(pedido, "ENTREGUE").statusCode());
        assertEquals(409, status(pedido, "CANCELADO").statusCode());
        assertEquals(400, status(pedido, "DESCONHECIDO").statusCode());
        long outro = id(enviar("POST", "/pedidos", dados).body());
        assertEquals(200, status(outro, "CANCELADO").statusCode());
        assertEquals(409, status(outro, "EM_PREPARO").statusCode());
    }

    private HttpResponse<String> status(long pedido, String status) throws Exception {
        return enviar("PATCH", "/pedidos/" + pedido + "/status", "{\"status\":\"" + status + "\"}");
    }

    private HttpResponse<String> enviar(String metodo, String caminho, String json) throws Exception {
        var builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + caminho));
        var body = json == null ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString(json);
        if (json != null) builder.header("Content-Type", "application/json");
        return client.send(builder.method(metodo, body).build(), HttpResponse.BodyHandlers.ofString());
    }

    private long id(String json) {
        var matcher = Pattern.compile("\"id\"\\s*:\\s*(\\d+)").matcher(json);
        assertTrue(matcher.find(), json);
        return Long.parseLong(matcher.group(1));
    }
}

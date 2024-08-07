            Dentro do seu código, o ReadMe deve conter:
              Instruções para rodar a sua aplicação, usando o orquestrador de container que preferir; Ajustar!
              Justificativa do padrão SAGA escolhido; OK
              Links com os relatórios dos processamentos do OWASP ZAP (antes e após a correção);
              Link com o relatório RIPD do sistema;
              Link para o desenho da arquitetura;
              Link para um vídeo com:
                O projeto rodando, inclusive com o padrão SAGA funcionando;
                Explicação do padrão SAGA escolhido e sua justificativa;
                Arquitetura da estrutura da nuvem e como a comunicação SAGA está montada.

# service-payment
Repositorio que responsavel por lidar com os pagamentos dos clientes ao realizar a entrega

Ederson Ribeiro Paz

OBS: Necessario ajustar arquivo.
Foodie service-payment é um microsserviço projetado para gerenciar a fase de pagamento dos pedidos. Ele ouve eventos de solicitação de pagamento, atualizando o status do pedido para '' e se comunica com outros microsserviços para gerenciar o ciclo de vida da produção.

## Tabela de Conteúdos

- [Introdução](#introdução)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Instalação](#instalação)
- [Cobertura de Testes](#cobertura-de-testes)
- [Docker](#docker)
- [Contribuindo](#contribuindo)
- [Licença](#licença)
- [Utilização do RabbitMQ]()
## Introdução

Foodie Production faz parte do projeto FoodieFlow, que visa otimizar o processo de gerenciamento de pedidos de alimentos. Este microsserviço é responsável por rastrear pedidos que estão na fase de produção e garantir que sejam atualizados e comunicados a outras partes do sistema.

## Funcionalidades

- Ouvi a solicitação de covbrança do pedido
- Atualiza dados de pagamento
- Comunicar-se com outros microsserviços para gerenciar o ciclo de vida da produção do pedido
- Envia informativo de pagamento

## Tecnologias Utilizadas

- NestJS
- TypeScript
- SQS (Amazon Simple Queue Service)
- Jest (para testes)
- Eslint e Prettier (para qualidade de código)
- Docker
- Mongodb

## Instalação

### Pré-requisitos

- Node.js (>=v21.6.2)
- npm (>=6.x) ou yarn
- Docker (para ambiente containerizado)
- Mongodb (conexao disponivel para aplicacao)

### Passos

1. Clone o repositório:

    ```bash
    git clone https://github.com/jobsonribeiro/service-payment
    cd foodie_production
    ```

2. Instale as dependências:

    ```bash
    npm install
    # ou
    yarn install
    ```

3. Inicie a aplicação:

    ```bash
    npm run start:dev
    # ou
    yarn start:dev
    ```

## Uso

Para executar a aplicação em um ambiente de desenvolvimento, use o comando de start como mostrado acima. Isso iniciará o servidor e monitorará mudanças nos arquivos.

Para produção, construa a aplicação e inicie-a usando:

```bash
npm run build
npm run start:prod
# ou
yarn build
yarn start:prod
```

## Docker
Para executar a aplicação usando Docker, você pode usar o Dockerfile fornecido no repositório.

#### Construindo a Imagem Docker
1 . Construa a imagem Docker:

```bash
docker build -t foodie_production .
```
2 . Execute o container Docker:
```bash
docker run -d -p 3000:3000 --env-file .env foodie_production
```

Isso iniciará a aplicação no modo de produção no porto 3000.

# Utilização de SAGA Coreografada com RabbitMQ

## Introdução
A SAGA coreografada é um padrão de design fundamental para a coordenação de transações distribuídas em sistemas de microsserviços. Este documento justifica tecnicamente a escolha da SAGA coreografada em nosso projeto e destaca a utilização do RabbitMQ como middleware de comunicação.

## Vantagens Técnicas da SAGA Coreografada

O SAGA coreografado permite que os microsserviços possam coordenar suas ações de forma assíncrona. Isso resulta em sistemas que podem processar operações em tempo real sem que haja bloqueios ou esperas entre serviços, melhorando a eficiência e o tempo de resposta, também, ao mesmo tempo, cada microsserviço gerencia seu próprio estado e interage com outros serviços através de eventos eliminando por sua vez a dependência de um orquestrador central, reduzindo os pontos únicos de falha e distribuindo a carga de processamento.

Desta forma a independência e autonomia permite uma maior escalabilidade horizontal, já que podem ser escalados horizontalmente, adicionando ou removendo instâncias conforme a demanda de cada serviço. Isso permite um ajuste dinâmico dos recursos do sistema, melhorando a capacidade de lidar com picos de carga. Como também podem continuar operando independentemente dos outros, isto é, se um serviço falhar, os outros continuam garantindo a sua continuidade sem interrupções. Além de implementar sua própria lógica de compensação, adaptando-se às suas necessidades específicas dando também um maior grau de especialização dos serviços, facilitando a manutenção, a evolução do sistema e personalizar cada comportamento de acordo com os requisitos do negócio mais facilmente.

## Utilização do RabbitMQ
O RabbitMQ foi escolhido como sistema principal de mensageria por suportar diferentes padrões de mensagens (fila, publicação/assinatura, etc.), permitindo a implementação de diversas estratégias de comunicação e facilitando a integração entre serviços heterogêneos, oferecendo também ferramentas avançadas de monitoramento e gerenciamento, permitindo uma visão detalhada do fluxo de mensagens e facilitando a detecção e resolução de problemas.

## Conclusão
A adoção do SAGA coreografado em conjunto com o RabbitMQ proporciona uma solução técnica robusta para a coordenação de transações distribuídas em ambientes de microsserviços. Essa combinação oferece uma arquitetura escalável, resiliente e flexível, capaz de atender às demandas de sistemas complexos, dinâmicos e com serviços mais independentes.

## Relatórios dos processamentos do OWASP ZAP (antes e após a correção);
Antes da correção: https://github.com/jobsonribeiro/service-payment/tree/dev/Relatorio/2024-07-02-ZAP-Report-

Após correção: https://github.com/jobsonribeiro/service-payment/tree/dev/Relatorio/2024-07-04-ZAP-Report-

## Relatório RIPD do sistema;
Verificar com o grupo o que seria.

## Desenho da arquitetura;
![desenho_arquitetura_aws](https://github.com/user-attachments/assets/0f68a272-6a0d-49f0-934f-4358ec973f3e)

## Link para um vídeo com:
Precisa ser produzido.

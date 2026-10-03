# UX Specification --- Habit Tracker Mobile

**Versão:** 0.1\
**Status:** Fonte de verdade de UX do MVP\
**Fonte funcional:** PRD v0.1\
**Direção visual:** Editorial / Typographic

------------------------------------------------------------------------

## 1. Objetivo

Este documento define a experiência de uso do MVP do Habit Tracker
Mobile.

O produto deve priorizar:

-   simplicidade;
-   interação direta;
-   velocidade;
-   clareza;
-   baixa carga cognitiva;
-   qualidade visual;
-   feedback imediato.

O objetivo não é oferecer grande quantidade de funcionalidades, mas
tornar as interações centrais extremamente simples e agradáveis.

------------------------------------------------------------------------

## 2. Princípios de UX

### 2.1 Interação direta

Sempre que possível, o usuário deve manipular diretamente o elemento que
deseja alterar.

Exemplo preferido:

`Tocar no dia → alterar conclusão`

Evitar:

`Abrir menu → selecionar ação → escolher data → confirmar`

### 2.2 Poucas decisões

A interface não deve solicitar configurações que não sejam necessárias.

Na criação inicial de um hábito, solicitar apenas o nome.

### 2.3 Feedback imediato

A interface deve reagir imediatamente às ações do usuário.

Operações locais devem utilizar atualização otimista quando apropriado.

### 2.4 Interface como feedback

Quando a própria mudança visual comunica claramente o resultado, evitar
mensagens adicionais como toast de sucesso.

### 2.5 Progressão sem gamificação excessiva

Streak, total e melhor sequência representam progresso.

Evitar transformar o MVP em um sistema de pontos, níveis, moedas,
rankings ou recompensas artificiais.

------------------------------------------------------------------------

## 3. Arquitetura de Navegação

A estrutura principal é:

``` text
App
│
├── Home
│   ├── Lista de hábitos
│   ├── Últimos 6 dias
│   └── Criar hábito
│
└── Habit Details
    ├── Métricas
    ├── Calendário
    └── Menu
        ├── Editar hábito
        └── Excluir hábito
```

Não utilizar bottom navigation no MVP.

A Home é a superfície principal do aplicativo.

------------------------------------------------------------------------

## 4. Home

A Home deve permitir que o usuário entenda rapidamente:

-   quais hábitos possui;
-   sua sequência atual;
-   seu total de conclusões;
-   o estado dos últimos dias;
-   o que precisa ser feito hoje.

### Header

Exibir:

-   título `Meus hábitos`;
-   data atual.

Exemplo:

``` text
Meus hábitos

Quinta-feira, 1 de outubro
```

Evitar no MVP:

-   logo decorativa;
-   avatar;
-   configurações;
-   elementos sem função direta.

------------------------------------------------------------------------

## 5. Lista de Hábitos

Os hábitos são apresentados verticalmente.

A ordem inicial é a ordem de criação.

Não ordenar automaticamente por:

-   streak;
-   total;
-   atividade recente.

Reordenação manual fica fora do MVP.

Cada hábito deve apresentar:

-   nome;
-   current streak;
-   total de conclusões;
-   últimos seis dias.

A interface deve evitar excesso de cards e containers.

Na direção Editorial / Typographic, cada hábito pode funcionar
visualmente como uma seção editorial separada principalmente por espaço,
tipografia e divisores sutis.

------------------------------------------------------------------------

## 6. Janela de Dias da Home

A Home exibe exatamente seis datas:

``` text
hoje - 5
hoje - 4
hoje - 3
hoje - 2
hoje - 1
hoje
```

Todos os dias válidos são editáveis.

O dia atual deve possuir distinção visual sutil.

Não adicionar rótulos excessivos apenas para indicar "hoje".

------------------------------------------------------------------------

## 7. DayStatus

O componente conceitual que representa cada dia é chamado de
`DayStatus`.

Funcionalmente, ele se comporta como um checkbox:

-   não concluído → concluído;
-   concluído → não concluído.

Entretanto, ele não precisa parecer um checkbox tradicional.

Estados necessários:

-   não concluído;
-   concluído;
-   hoje;
-   hoje concluído;
-   desabilitado.

O visual definitivo pode evoluir durante a implementação.

A semântica e o comportamento não devem mudar.

O componente deve possuir área de toque confortável mesmo quando seu
elemento visual for pequeno.

------------------------------------------------------------------------

## 8. Interação com o Habit

Existem duas áreas conceituais de interação.

### DayStatus

Toque altera diretamente a conclusão daquela data.

### Restante da seção do hábito

Toque abre `Habit Details`.

A interação com o DayStatus não deve abrir os detalhes do hábito.

------------------------------------------------------------------------

## 9. Criar Hábito

A criação deve utilizar preferencialmente um bottom sheet.

Fluxo:

``` text
Home
↓
+
↓
Bottom Sheet
↓
Nome do hábito
↓
Criar hábito
```

Ao abrir:

-   campo recebe foco automaticamente;
-   teclado é apresentado;
-   CTA de criação fica visível.

Solicitar inicialmente somente:

`Nome do hábito`

Não solicitar:

-   frequência;
-   dias da semana;
-   categoria;
-   meta;
-   cor;
-   ícone.

------------------------------------------------------------------------

## 10. Validação da Criação

O nome é obrigatório.

Aplicar trim antes de persistir.

Não permitir nomes compostos apenas por espaços.

Quando o formulário estiver inválido, o CTA deve permanecer desabilitado
ou apresentar feedback inline.

Evitar native alerts para validações simples.

------------------------------------------------------------------------

## 11. Pós-Criação

Após criação bem-sucedida:

1.  fechar bottom sheet;
2.  inserir novo hábito na Home;
3.  utilizar transição visual curta, se apropriado.

Não exibir toast de sucesso quando o aparecimento do novo hábito já
comunica claramente o resultado.

------------------------------------------------------------------------

## 12. Empty State

Quando não houver hábitos, a Home deve parecer intencional e não vazia
por acidente.

Preferir composição tipográfica minimalista.

Exemplo conceitual:

``` text
Meus hábitos

Comece pequeno.

Crie um hábito e acompanhe
sua evolução todos os dias.

+ Criar hábito
```

Evitar ilustração genérica apenas para preencher espaço.

------------------------------------------------------------------------

## 13. Habit Details

A tela de detalhes deve concentrar:

-   nome do hábito;
-   current streak;
-   total de conclusões;
-   melhor sequência;
-   histórico em calendário.

Estrutura conceitual:

``` text
←

Academia

14
DIAS SEGUIDOS

150
CONCLUSÕES

31
MELHOR SEQUÊNCIA

[ calendário ]
```

Current streak deve possuir maior hierarquia visual.

Total e melhor sequência funcionam como métricas secundárias.

------------------------------------------------------------------------

## 14. Header de Habit Details

Exibir:

-   botão voltar;
-   menu de opções.

O menu deve conter somente as ações necessárias ao MVP:

-   Editar hábito;
-   Excluir hábito.

Não incluir por padrão:

-   estatísticas avançadas;
-   compartilhamento;
-   duplicação;
-   configurações de frequência;
-   outras funcionalidades fora do PRD.

------------------------------------------------------------------------

## 15. Calendário

O calendário representa a jornada completa do hábito.

Deve permitir:

-   visualizar dias concluídos;
-   visualizar dias não concluídos;
-   identificar hoje;
-   editar datas válidas;
-   navegar por meses válidos.

Estados necessários:

-   normal;
-   completed;
-   today;
-   today + completed;
-   disabled.

A linguagem visual de conclusão deve ser semanticamente consistente com
a Home, mesmo que o componente não seja visualmente idêntico ao
DayStatus.

------------------------------------------------------------------------

## 16. Navegação do Calendário

Utilizar controles visíveis para:

-   mês anterior;
-   mês seguinte.

Swipe entre meses pode existir como melhoria complementar, mas não deve
ser o único mecanismo de navegação.

Não permitir navegação para meses futuros.

Não é necessário permitir navegação para meses anteriores ao mês de
criação do hábito.

------------------------------------------------------------------------

## 17. Datas Futuras

Datas posteriores a hoje devem estar desabilitadas.

Devem:

-   possuir estado visual apropriado;
-   não responder à ação de conclusão.

------------------------------------------------------------------------

## 18. Datas Anteriores à Criação

Datas anteriores à criação do hábito não representam falhas.

Elas são indisponíveis.

Devem ser visualmente distinguíveis dos dias válidos não concluídos.

Não permitir interação.

------------------------------------------------------------------------

## 19. Edição pelo Calendário

Tocar em uma data válida alterna:

``` text
não concluído ↔ concluído
```

A interface deve atualizar imediatamente:

-   estado do dia;
-   current streak;
-   total;
-   melhor sequência.

Alterações retroativas devem parecer tão diretas quanto alterações
feitas pela Home.

------------------------------------------------------------------------

## 20. Editar Hábito

A edição deve ser acessada pelo menu de Habit Details.

Preferir reutilizar o mesmo componente/formulário da criação.

Fluxo:

``` text
Habit Details
↓
Menu
↓
Editar hábito
↓
Bottom Sheet
```

Permitir alteração do nome.

A edição do nome não altera o histórico ou métricas.

------------------------------------------------------------------------

## 21. Excluir Hábito

Exclusão exige confirmação.

Fluxo:

``` text
Habit Details
↓
Menu
↓
Excluir hábito
↓
Confirmação
```

Mensagem conceitual:

``` text
Excluir Academia?

Todo o histórico deste hábito será removido.

Cancelar    Excluir
```

A ação destrutiva deve possuir diferenciação visual adequada.

Após exclusão:

-   fechar confirmação;
-   retornar à Home;
-   remover hábito visualmente.

Uma animação curta de saída pode ser utilizada.

------------------------------------------------------------------------

## 22. Optimistic UI

A marcação de conclusão deve parecer instantânea.

Fluxo esperado:

``` text
tap
↓
feedback visual imediato
↓
persistência
```

Caso a persistência falhe:

``` text
rollback visual
↓
feedback discreto de erro
```

Não bloquear visualmente o DayStatus aguardando uma operação local
quando isso não for necessário.

------------------------------------------------------------------------

## 23. Feedback Tátil

Utilizar haptics de forma restrita.

Sugestões:

-   feedback leve ao concluir;
-   feedback distinto e discreto ao atingir novo recorde;
-   feedback leve na confirmação de exclusão.

Evitar haptics em toda interação.

Falha de haptic nunca interfere na ação.

------------------------------------------------------------------------

## 24. Microinterações

### Conclusão

``` text
tap
↓
press feedback
↓
mudança de estado
↓
métrica atualizada
```

A animação deve ser curta.

### Desmarcação

Utilizar feedback mais neutro que a conclusão.

### Métricas

Mudanças numéricas podem utilizar transição vertical ou fade curto.

Exemplo:

``` text
14 → 15
```

### Novo recorde

Pode receber feedback um pouco mais perceptível, mas inferior a
aproximadamente um segundo.

Evitar:

-   modal;
-   confete;
-   celebração longa.

### Criação

Novo hábito pode entrar com fade/movimento sutil.

### Exclusão

Seção pode desaparecer com fade/collapse curto.

### Calendário

Mudança de mês pode utilizar movimento horizontal curto.

------------------------------------------------------------------------

## 25. Feedback de Erro

Preferir erros próximos ao local da ação.

### Erro que bloqueia ação

Usar feedback inline/local.

Exemplo:

-   nome inválido.

### Erro recuperável

Utilizar mensagem discreta.

Evitar native alerts quando uma solução integrada ao design for
possível.

------------------------------------------------------------------------

## 26. Splash e Inicialização

Evitar splash artificialmente longo.

O usuário deve chegar à Home o mais rapidamente possível.

Não utilizar splash como animação de branding demorada.

------------------------------------------------------------------------

## 27. FAB / Ação de Criação

A Home deve possuir ação clara para criar hábito.

Pode ser representada por um botão `+` flutuante, consistente com a
direção visual.

Ao rolar uma lista longa, a ação deve continuar facilmente acessível.

No empty state, pode existir também um CTA explícito `Criar hábito`.

------------------------------------------------------------------------

## 28. Scroll

A Home utiliza lista vertical.

Não utilizar:

-   paginação horizontal de hábitos;
-   carrossel;
-   agrupamentos complexos.

Habit Details também pode rolar verticalmente quando necessário.

------------------------------------------------------------------------

## 29. Direção Visual

Direção selecionada:

**Editorial / Typographic**

A identidade deve ser construída principalmente através de:

-   tipografia;
-   números;
-   escala;
-   whitespace;
-   alinhamento;
-   estado;
-   cor de progresso.

Evitar depender de:

-   excesso de cards;
-   sombras;
-   ícones decorativos;
-   emojis;
-   ilustrações;
-   bordas em todos os elementos.

------------------------------------------------------------------------

## 30. Hierarquia Tipográfica

Conceitualmente:

-   métricas: 32--40;
-   títulos: 24--28;
-   nome do hábito: 18--20;
-   corpo: 14--16;
-   labels/datas: 12--13.

Os valores definitivos pertencem ao Design System.

Números de métricas devem possuir forte presença visual.

------------------------------------------------------------------------

## 31. Cor

Paleta conceitual:

-   background quase branco;
-   superfícies em cinza muito claro quando necessárias;
-   texto principal quase preto;
-   texto secundário cinza;
-   uma cor accent;
-   completed derivado do accent;
-   inactive em cinza;
-   danger reservado a ações destrutivas.

Cor deve ter função.

Não utilizar várias cores apenas para decoração.

------------------------------------------------------------------------

## 32. Containers

Utilizar poucos containers.

Evitar o padrão:

``` text
card
  card
    card
```

Separação deve preferir:

-   espaço;
-   tipografia;
-   alinhamento;
-   divisores sutis.

------------------------------------------------------------------------

## 33. Ícones

Utilizar somente quando ajudam a interação.

Exemplos válidos:

-   voltar;
-   menu;
-   navegação do calendário;
-   adicionar.

Evitar ícones decorativos para representar streak ou recorde quando
tipografia e texto forem suficientes.

------------------------------------------------------------------------

## 34. Acessibilidade

Controles devem possuir touch targets confortáveis.

Não depender exclusivamente de cor para indicar conclusão.

Fornecer labels acessíveis.

Exemplo:

``` text
1 de outubro, Academia, concluído
```

Respeitar legibilidade e, quando possível, font scaling do sistema.

------------------------------------------------------------------------

## 35. Dark Mode

Dark mode não faz parte do MVP.

Entretanto, a UI deve utilizar tokens semânticos para permitir sua
implementação futura sem reescrever todos os componentes.

Não implementar dark mode antecipadamente.

------------------------------------------------------------------------

## 36. Estados de Loading

Como o produto é local-first, loading prolongado não deve fazer parte da
experiência normal.

Evitar spinners para operações locais rápidas.

Durante inicialização do banco, preferir uma transição limpa para a
Home.

------------------------------------------------------------------------

## 37. Estados Principais

A experiência deve contemplar explicitamente:

### Home

-   loading inicial;
-   vazia;
-   com hábitos.

### Habit

-   sem conclusões;
-   com conclusões;
-   streak ativo;
-   streak zerado.

### Calendar

-   mês atual;
-   mês histórico;
-   datas indisponíveis;
-   datas concluídas.

### Form

-   vazio;
-   válido;
-   inválido;
-   submetendo quando necessário.

------------------------------------------------------------------------

## 38. Ordem Inicial dos Hábitos

Utilizar ordem de criação.

Não alterar automaticamente a posição de um hábito quando:

-   for concluído;
-   aumentar streak;
-   aumentar total.

Reordenação manual poderá ser avaliada futuramente.

------------------------------------------------------------------------

## 39. Consistência entre Home e Details

A mesma informação deve produzir o mesmo significado nas duas
superfícies.

Se Home apresenta:

``` text
14 dias seguidos
```

Habit Details deve apresentar o mesmo valor.

Uma edição no calendário deve refletir na Home imediatamente quando o
usuário retornar.

------------------------------------------------------------------------

## 40. Fluxo Principal --- Primeiro Uso

``` text
Abrir app
↓
Empty State
↓
Criar hábito
↓
Digitar nome
↓
Criar
↓
Home com primeiro hábito
↓
Marcar hoje
↓
Feedback visual imediato
```

Esse fluxo deve exigir o mínimo possível de decisões.

------------------------------------------------------------------------

## 41. Fluxo Principal --- Uso Diário

``` text
Abrir app
↓
Home
↓
Identificar hábito
↓
Tocar no dia atual
↓
Conclusão registrada
↓
Streak/total atualizados
```

Idealmente, uma conclusão diária deve exigir apenas um toque após a Home
estar visível.

------------------------------------------------------------------------

## 42. Fluxo Principal --- Corrigir Histórico Recente

``` text
Home
↓
Tocar em um dos últimos cinco dias
↓
Estado alterado
↓
Métricas recalculadas
```

Não exigir abertura de Habit Details para correções dentro da janela de
seis dias.

------------------------------------------------------------------------

## 43. Fluxo Principal --- Corrigir Histórico Antigo

``` text
Home
↓
Habit Details
↓
Navegar no calendário
↓
Tocar na data
↓
Estado alterado
↓
Métricas recalculadas
```

------------------------------------------------------------------------

## 44. Fluxo Principal --- Gerenciar Hábito

``` text
Home
↓
Habit Details
↓
Menu
├── Editar
└── Excluir
```

Manter poucas ações.

------------------------------------------------------------------------

## 45. Fora do Escopo de UX do MVP

Não projetar fluxos para:

-   login;
-   onboarding multipágina;
-   escolha de frequência;
-   notificações;
-   categorias;
-   tags;
-   rotinas;
-   social;
-   ranking;
-   achievements;
-   XP;
-   analytics avançados;
-   IA;
-   compartilhamento;
-   cloud sync;
-   marketplace;
-   desafios.

Esses fluxos não devem aparecer como placeholders.

------------------------------------------------------------------------

## 46. Relação com o Mockup

O mockup existente representa uma **direção visual**, não uma
especificação funcional superior ao PRD.

Elementos do mockup que estejam fora do PRD não devem ser implementados
automaticamente.

Em particular, não assumir como aprovados apenas por aparecerem no
mockup:

-   estatísticas avançadas;
-   taxa de conclusão;
-   opção "Ver estatísticas";
-   opção "Ir para hoje";
-   qualquer outra funcionalidade não definida nos documentos.

A identidade visual do mockup pode ser utilizada como referência para:

-   composição;
-   tipografia;
-   proporções;
-   whitespace;
-   tom das superfícies;
-   uso do accent.

------------------------------------------------------------------------

## 47. Critérios de Aceite de UX

O MVP deve permitir que o usuário:

1.  entenda rapidamente seus hábitos ao abrir o app;
2.  registre a conclusão de hoje com interação direta;
3.  corrija qualquer um dos últimos seis dias pela Home;
4.  perceba imediatamente alterações em streak e total;
5.  acesse o histórico completo de um hábito;
6.  edite uma data histórica válida diretamente no calendário;
7.  crie um hábito informando somente seu nome;
8.  renomeie um hábito sem afetar histórico;
9.  exclua um hábito com confirmação clara;
10. utilize o fluxo principal sem menus ou configurações desnecessárias.

------------------------------------------------------------------------

## 48. Princípio Final

O usuário não deve sentir que está administrando um sistema de hábitos.

Ele deve sentir que está simplesmente registrando o que fez e enxergando
sua consistência ao longo do tempo.

**Poucas funcionalidades + execução excelente.**

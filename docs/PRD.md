# PRD — Habit Tracker Mobile

**Versão:** 0.1  
**Status:** MVP — Definição inicial  
**Plataforma:** Mobile  
**Tipo de produto:** Habit Tracker  
**Prioridade:** Simplicidade, UX e qualidade visual

---

# 1. Visão do Produto

Criar um aplicativo mobile minimalista para acompanhamento de hábitos, permitindo que o usuário registre facilmente a realização de atividades recorrentes e acompanhe sua evolução através de três elementos principais:

1. **Streak atual** — quantidade de dias consecutivos em que o hábito foi realizado.
2. **Total de conclusões** — quantidade total de vezes em que o hábito foi realizado.
3. **Histórico visual** — calendário demonstrando os dias em que o hábito foi ou não realizado.

Exemplo:

**Academia**

🔥 3 dias seguidos  
150 conclusões  
🏆 Recorde: 17 dias

O aplicativo não pretende competir através da quantidade de funcionalidades.

Seu principal diferencial será oferecer uma experiência extremamente simples, rápida e visualmente refinada.

---

# 2. Problema

Aplicativos de acompanhamento de hábitos frequentemente introduzem diversas configurações antes que o usuário consiga começar a utilizar o produto.

Entre elas:

- frequência semanal;
- dias específicos;
- metas;
- categorias;
- horários;
- notificações;
- pontuações;
- níveis;
- gamificação;
- estatísticas complexas.

Para usuários que desejam simplesmente registrar atividades recorrentes, essas funcionalidades podem criar atrito desnecessário.

O aplicativo deve responder de maneira simples a três perguntas:

**Estou mantendo esse hábito?**

**Há quanto tempo estou mantendo esse hábito?**

**Quanto já fiz ao longo do tempo?**

---

# 3. Proposta de Valor

Permitir que o usuário registre e acompanhe hábitos com o mínimo possível de interação.

O fluxo principal deve ser:

**Abrir aplicativo → visualizar hábitos → marcar checkbox → continuar o dia.**

Registrar um hábito deve exigir apenas um toque.

A experiência deve priorizar:

- rapidez;
- clareza;
- feedback visual;
- sensação de progresso;
- baixo esforço cognitivo.

---

# 4. Público-Alvo Inicial

Pessoas interessadas em acompanhar atividades recorrentes sem necessidade de configurações complexas.

O aplicativo não será direcionado exclusivamente para produtividade, saúde ou estudos.

Exemplos de hábitos:

- Academia
- Leitura
- Corrida
- Meditação
- Estudar
- Inglês
- Alongamento
- Praticar instrumento
- Beber água

O nome e o significado do hábito são definidos livremente pelo usuário.

---

# 5. Conceitos Fundamentais

## 5.1 Hábito

Um hábito representa uma atividade que o usuário deseja acompanhar ao longo do tempo.

No MVP, um hábito possui:

- identificador;
- nome;
- data de criação;
- histórico de conclusões;
- streak atual;
- maior streak histórico;
- total de conclusões.

Não existe configuração de frequência no MVP.

---

## 5.2 Conclusão

Uma conclusão representa que determinado hábito foi realizado em determinada data.

Cada hábito poderá possuir no máximo **uma conclusão por dia**.

Exemplo:

**Academia**

- 28/09 — realizado
- 29/09 — realizado
- 30/09 — realizado
- 01/10 — realizado

Resultado:

🔥 Streak: 4  
Total: 4

---

## 5.3 Streak

O streak representa a sequência atual de dias consecutivos em que o hábito foi realizado.

Exemplo:

28/09 ✓  
29/09 ✓  
30/09 ✓  
01/10 ✓

Streak atual:

**🔥 4 dias**

Uma data sem conclusão quebra a sequência.

---

## 5.4 Total de Conclusões

Representa a quantidade acumulada de dias em que o hábito foi marcado como realizado.

Exemplo:

**Academia**

🔥 3 dias seguidos  
**150 conclusões**

O total não é perdido quando uma ofensiva é quebrada.

---

## 5.5 Maior Streak

O aplicativo também deverá manter a maior sequência já alcançada naquele hábito.

Exemplo:

🔥 Atual: 7 dias  
🏆 Recorde: 31 dias

---

# 6. Princípios do Produto

## 6.1 Simplicidade

O usuário não deverá configurar detalhes desnecessários para criar um hábito.

Inicialmente será necessário apenas:

**Nome do hábito**

---

## 6.2 Ação em Um Toque

A interação principal será um checkbox.

O usuário toca no checkbox e o hábito é imediatamente marcado ou desmarcado.

Não deverão existir diálogos de confirmação para essa ação.

---

## 6.3 Progresso Sempre Visível

A Home deverá permitir que o usuário entenda rapidamente sua situação sem acessar relatórios ou outras telas.

Cada hábito deverá apresentar:

- nome;
- streak atual;
- total de conclusões;
- últimos cinco dias;
- dia atual.

---

## 6.4 Histórico Visual

O histórico completo será apresentado através de calendário.

O usuário deverá conseguir identificar rapidamente períodos de maior ou menor consistência.

---

## 6.5 Interface como Parte do Produto

UI e UX são diferenciais centrais.

O aplicativo deverá priorizar:

- hierarquia visual;
- tipografia confortável;
- espaçamento adequado;
- poucos elementos simultaneamente;
- microinterações;
- feedback imediato;
- animações discretas;
- navegação previsível.

---

# 7. Escopo Funcional do MVP

O MVP será composto principalmente por:

1. Criar hábito.
2. Listar hábitos.
3. Marcar/desmarcar conclusões.
4. Visualizar os últimos seis dias na Home.
5. Visualizar detalhes do hábito.
6. Visualizar calendário histórico.
7. Editar histórico.
8. Editar hábito.
9. Excluir hábito.

---

# 8. Home

A Home será a principal tela do aplicativo.

Seu objetivo é permitir que o usuário:

- veja seus hábitos;
- acompanhe rapidamente seu progresso;
- visualize sua atividade recente;
- registre conclusões sem precisar navegar para outra tela.

Cada hábito será apresentado através de um componente visual próprio, denominado conceitualmente de `HabitCard`.

Exemplo:

**Academia**                         🔥 3  
150 conclusões

| S | D | S | T | Q | HOJE |
|---|---|---|---|---|------|
| 26 | 27 | 28 | 29 | 30 | 01 |
| ✓ | □ | □ | ✓ | ✓ | ✓ |

---

# 9. Janela de Dias da Home

Cada hábito deverá mostrar exatamente:

**5 dias anteriores + dia atual**

Total:

**6 dias**

Essa janela é móvel.

Por exemplo, em 01/10:

26/09  
27/09  
28/09  
29/09  
30/09  
01/10

Em 02/10:

27/09  
28/09  
29/09  
30/09  
01/10  
02/10

Todos os seis dias deverão permitir interação.

---

# 10. Checkbox

Cada dia exibido na Home terá seu próprio estado.

Estados possíveis:

- concluído;
- não concluído.

Ao tocar em uma data não concluída:

**checkbox → marcado**

Ao tocar novamente:

**checkbox → desmarcado**

A interface deverá refletir a alteração imediatamente.

---

# 11. Regra de Atualização do Total

Ao marcar uma data:

**Total = Total + 1**

Ao desmarcar:

**Total = Total - 1**

Exemplo:

Antes:

149 conclusões

Usuário marca hoje.

Depois:

150 conclusões

Se desmarcar:

149 conclusões

---

# 12. Regra de Atualização do Streak

Alterações no histórico podem modificar o streak de maneira diferente do contador total.

Exemplo:

27 ✓  
28 ✓  
29 □  
30 ✓  
01 ✓

Streak atual:

🔥 2

Se o usuário marcar 29:

27 ✓  
28 ✓  
29 ✓  
30 ✓  
01 ✓

O total aumenta apenas em `+1`, mas o streak passa de:

**2 → 5**

Portanto, após uma alteração de conclusão, o aplicativo deverá recalcular a sequência correspondente.

---

# 13. Regra de Desmarcação

A mesma lógica será aplicada ao remover uma conclusão.

Exemplo:

27 ✓  
28 ✓  
29 ✓  
30 ✓  
01 ✓

🔥 5

Usuário desmarca 29:

27 ✓  
28 ✓  
29 □  
30 ✓  
01 ✓

O total diminui em `-1`.

O streak atual passa para:

🔥 2

---

# 14. Streak Durante o Dia Atual

O usuário não perde sua sequência simplesmente porque ainda não realizou o hábito no dia atual.

Exemplo:

29 ✓  
30 ✓  
01 ← hoje

Mesmo que 01 ainda esteja desmarcado:

🔥 2

O dia atual permanece disponível para continuar a sequência.

Caso o dia termine sem conclusão, no dia seguinte a sequência será considerada quebrada.

Exemplo em 02/10:

29 ✓  
30 ✓  
01 □  
02 ← hoje

Resultado:

🔥 0

---

# 15. Maior Streak

Sempre que o histórico for alterado, o aplicativo deverá determinar também o maior streak existente.

Exemplo:

Sequência histórica máxima:

31 dias

Sequência atual:

7 dias

Resultado:

🔥 7 dias  
🏆 31 dias

Alterações retroativas no calendário também poderão modificar o maior streak.

---

# 16. Tela de Detalhes do Hábito

Ao tocar em um hábito na Home, será aberta sua tela de detalhes.

A tela deverá apresentar pelo menos:

**Academia**

🔥 14  
dias seguidos

232 conclusões

🏆 Recorde: 31 dias

**Outubro 2026**

[calendário]

A hierarquia exata será definida posteriormente durante a etapa de UI/UX.

---

# 17. Calendário

O calendário será a principal representação do histórico completo.

Deverá permitir:

- visualizar o mês atual;
- visualizar meses anteriores;
- identificar dias concluídos;
- identificar dias sem conclusão;
- identificar o dia atual;
- navegar entre meses.

O calendário não deverá utilizar elementos visuais excessivos.

Dias concluídos receberão destaque através do design.

Dias não concluídos permanecerão visualmente neutros.

---

# 18. Edição pelo Calendário

O calendário também será interativo.

O usuário poderá tocar em uma data válida para alternar entre:

**Concluído ↔ Não concluído**

Isso permite corrigir registros esquecidos.

Por exemplo:

O usuário foi à academia ontem, mas esqueceu de registrar.

Ele poderá acessar o calendário e marcar o dia anterior.

A alteração deverá atualizar imediatamente:

- calendário;
- total;
- streak atual;
- maior streak.

---

# 19. Datas Futuras

Datas futuras não poderão ser marcadas.

Elas deverão permanecer visualmente desabilitadas.

Portanto:

**Data ≤ hoje → potencialmente editável**

**Data > hoje → não editável**

---

# 20. Data de Criação do Hábito

O histórico de um hábito começa na data de sua criação.

Datas anteriores à criação não representam falhas.

Exemplo:

Hábito criado em:

**01/10/2026**

Datas de setembro não devem ser consideradas dias não realizados daquele hábito.

Elas simplesmente estão fora de seu período de existência.

---

# 21. Criação de Hábito

A criação deve ser extremamente simples.

Campos obrigatórios:

**Nome**

Exemplo:

**Novo hábito**

Nome  
`Academia`

**Criar hábito**

Nenhuma outra configuração será obrigatória no MVP.

---

# 22. Validação do Nome

O nome deverá:

- ser obrigatório;
- não aceitar apenas espaços;
- possuir limite de caracteres adequado à interface.

O limite exato poderá ser definido na especificação técnica/UI.

---

# 23. Edição do Hábito

O usuário deverá conseguir editar um hábito existente.

No MVP, a principal edição será:

**Nome**

Alterar o nome não deverá afetar:

- histórico;
- streak;
- total;
- maior streak.

---

# 24. Exclusão do Hábito

O usuário poderá excluir um hábito.

Como a exclusão remove histórico acumulado, deverá existir confirmação.

Exemplo:

**Excluir Academia?**

Todo o histórico deste hábito será removido.

**Cancelar | Excluir**

---

# 25. Estado Vazio

Caso o usuário ainda não tenha hábitos, a Home deverá apresentar um estado vazio simples.

Exemplo conceitual:

**Nenhum hábito ainda**

Crie seu primeiro hábito e comece a acompanhar sua consistência.

**+ Criar hábito**

O estado vazio deverá fazer parte da experiência visual do produto e não parecer uma tela incompleta.

---

# 26. Feedback de Interação

Marcar um hábito deverá produzir feedback visual imediato.

Possibilidades a serem exploradas no design:

- animação do checkbox;
- pequena alteração no card;
- animação do streak;
- transição do contador;
- feedback tátil;
- destaque temporário.

As animações deverão ser discretas.

O objetivo é tornar a conclusão satisfatória sem transformar o aplicativo em uma experiência excessivamente gamificada.

---

# 27. Fluxos Principais

## Fluxo 1 — Primeiro uso

Abrir aplicativo  
→ Home vazia  
→ Criar hábito  
→ Informar nome  
→ Criar  
→ Hábito aparece na Home

---

## Fluxo 2 — Registrar hábito

Abrir aplicativo  
→ Localizar hábito  
→ Marcar checkbox de hoje  
→ Atualizar visualmente  
→ Atualizar total  
→ Atualizar streak  
→ Atualizar recorde quando aplicável

---

## Fluxo 3 — Corrigir um dos últimos dias

Abrir aplicativo  
→ Localizar hábito  
→ Localizar um dos cinco dias anteriores  
→ Marcar/desmarcar checkbox  
→ Atualizar métricas imediatamente

---

## Fluxo 4 — Consultar histórico

Home  
→ Tocar no hábito  
→ Abrir detalhes  
→ Visualizar métricas  
→ Visualizar calendário

---

## Fluxo 5 — Corrigir histórico antigo

Detalhes do hábito  
→ Navegar até mês desejado  
→ Selecionar data  
→ Marcar/desmarcar  
→ Atualizar calendário  
→ Atualizar total  
→ Recalcular streak  
→ Recalcular recorde

---

## Fluxo 6 — Editar hábito

Detalhes  
→ Menu de opções  
→ Editar  
→ Alterar nome  
→ Salvar

---

## Fluxo 7 — Excluir hábito

Detalhes  
→ Menu de opções  
→ Excluir  
→ Solicitar confirmação  
→ Confirmar  
→ Remover hábito e histórico

---

# 28. Requisitos Funcionais

### RF-01 — Criar hábito

O sistema deverá permitir criar um hábito informando seu nome.

### RF-02 — Listar hábitos

O sistema deverá apresentar os hábitos existentes na Home.

### RF-03 — Atividade recente

Cada hábito deverá apresentar o dia atual e os cinco dias anteriores.

### RF-04 — Registrar conclusão

O sistema deverá permitir marcar uma conclusão através do checkbox.

### RF-05 — Remover conclusão

O sistema deverá permitir desmarcar uma conclusão existente.

### RF-06 — Atualizar total

O total deverá ser atualizado imediatamente após marcação ou desmarcação.

### RF-07 — Atualizar streak

O streak deverá refletir a sequência válida após qualquer alteração no histórico.

### RF-08 — Maior streak

O sistema deverá determinar o maior streak histórico do hábito.

### RF-09 — Visualizar detalhes

O usuário deverá conseguir acessar os detalhes de cada hábito.

### RF-10 — Visualizar calendário

Os detalhes deverão apresentar o histórico através de calendário.

### RF-11 — Navegar pelo histórico

O usuário deverá conseguir navegar entre meses disponíveis.

### RF-12 — Editar histórico

Datas válidas deverão permitir marcação/desmarcação.

### RF-13 — Bloquear datas futuras

O sistema não deverá permitir conclusões em datas futuras.

### RF-14 — Editar hábito

O usuário deverá conseguir alterar o nome de um hábito.

### RF-15 — Excluir hábito

O usuário deverá conseguir excluir um hábito e seu histórico mediante confirmação.

---

# 29. Regras de Negócio

### RN-01

Um hábito poderá possuir no máximo uma conclusão por data.

### RN-02

Marcar uma conclusão aumenta o total em uma unidade.

### RN-03

Desmarcar uma conclusão reduz o total em uma unidade.

### RN-04

O total nunca poderá ser negativo.

### RN-05

O streak representa dias consecutivos concluídos.

### RN-06

O dia atual ainda não concluído não quebra imediatamente uma sequência existente.

### RN-07

Um dia passado não concluído quebra a sequência.

### RN-08

Alterações retroativas podem aumentar ou diminuir o streak.

### RN-09

Alterações retroativas podem aumentar ou diminuir o maior streak histórico.

### RN-10

Datas futuras não poderão possuir conclusões.

### RN-11

Datas anteriores à criação do hábito não serão consideradas falhas.

### RN-12

A Home deverá disponibilizar edição para hoje e os cinco dias anteriores.

### RN-13

O calendário deverá permitir edição de todo o histórico válido do hábito.

### RN-14

Excluir um hábito remove também seu histórico.

---

# 30. Requisitos Não Funcionais

## RNF-01 — Performance

A marcação de um hábito deve aparentar ser instantânea.

A interface não deverá aguardar operações demoradas para fornecer feedback ao usuário.

## RNF-02 — Responsividade

A interface deverá funcionar adequadamente em diferentes dimensões de dispositivos mobile.

## RNF-03 — Consistência

As métricas apresentadas na Home e na tela de detalhes deverão representar o mesmo estado.

## RNF-04 — Persistência

As conclusões não poderão ser perdidas ao fechar o aplicativo.

## RNF-05 — Integridade

Não poderão existir duas conclusões para o mesmo hábito na mesma data.

## RNF-06 — Offline

A arquitetura deverá considerar funcionamento local como comportamento natural do aplicativo.

A necessidade de sincronização será avaliada posteriormente.

## RNF-07 — UX

A interação principal não deverá exigir navegação adicional.

O usuário deve conseguir registrar hábitos diretamente na Home.

---

# 31. Diretrizes Iniciais de UX

A Home será a tela mais importante do aplicativo.

O design deverá priorizar a leitura vertical dos hábitos.

Cada `HabitCard` deverá comunicar rapidamente:

**O que é?**

Nome do hábito.

**Como estou?**

Streak.

**Quanto já fiz?**

Total.

**Como foram meus últimos dias?**

Linha dos seis dias.

**O que faço agora?**

Checkbox.

A quantidade de elementos decorativos deverá ser reduzida.

---

# 32. Componentes Conceituais Principais

A futura implementação deverá provavelmente possuir componentes equivalentes a:

### HabitCard

Responsável pela representação do hábito na Home.

Contém:

- nome;
- streak;
- total;
- RecentActivity.

### RecentActivity

Representa os seis dias exibidos na Home.

Contém seis `DayCheck`.

### DayCheck

Representa:

- dia da semana;
- data;
- estado;
- checkbox;
- interação.

### HabitCalendar

Representa o histórico completo.

### StreakIndicator

Representação visual da ofensiva atual.

### TotalIndicator

Representação do total acumulado.

### BestStreakIndicator

Representação do maior streak.

Esses nomes são conceituais e não obrigam a futura implementação a utilizar exatamente essa estrutura.

---

# 33. Fora do Escopo do MVP

Não fazem parte da primeira versão:

- configuração de frequência;
- dias específicos da semana;
- meta X vezes por semana;
- categorias;
- tags;
- grupos de hábitos;
- rotinas;
- pontos;
- XP;
- níveis;
- moedas;
- ranking;
- amigos;
- feed social;
- conquistas;
- gráficos avançados;
- estatísticas avançadas;
- inteligência artificial;
- compartilhamento;
- widgets;
- integrações externas;
- desafios;
- marketplace;
- personalização avançada.

Notificações também não são prioridade inicial.

---

# 34. Autenticação e Sincronização

A necessidade de autenticação não será requisito obrigatório para o primeiro MVP.

Uma primeira versão poderá trabalhar exclusivamente com persistência local.

Posteriormente poderão ser avaliados:

- conta do usuário;
- backup;
- sincronização entre dispositivos;
- armazenamento em nuvem.

A arquitetura deverá evitar decisões que tornem uma futura sincronização desnecessariamente difícil, sem implementar antecipadamente essa complexidade.

---

# 35. Métricas Centrais do Produto

O conceito do produto será sustentado por três representações.

## Consistência

Representada pelo:

**🔥 Streak**

Responde:

**"Há quanto tempo estou mantendo isso?"**

## Acúmulo

Representado pelo:

**Total de conclusões**

Responde:

**"Quanto eu já fiz?"**

## Jornada

Representada pelo:

**Calendário**

Responde:

**"Como foi minha consistência ao longo do tempo?"**

Esses três elementos formam o núcleo do produto.

---

# 36. Critério de Sucesso do MVP

O MVP será considerado funcionalmente bem-sucedido quando um usuário conseguir:

1. abrir o aplicativo;
2. criar um hábito rapidamente;
3. visualizar seus hábitos;
4. registrar uma conclusão com um toque;
5. visualizar os últimos cinco dias e o dia atual;
6. corrigir registros recentes diretamente pela Home;
7. acompanhar streak e total;
8. abrir um hábito;
9. visualizar todo seu histórico no calendário;
10. corrigir registros antigos;
11. compreender sua evolução sem precisar de explicações adicionais.

O principal critério qualitativo será:

**A experiência deve parecer mais simples do que utilizar uma lista de tarefas tradicional para acompanhar hábitos.**

---

# 37. Direção do Produto

O aplicativo deverá evitar crescer horizontalmente antes de aperfeiçoar sua experiência principal.

A prioridade deverá ser:

**Poucas funcionalidades + execução excelente.**

Antes de adicionar novos recursos, deverão ser aperfeiçoados:

- Home;
- HabitCard;
- interação dos checkboxes;
- calendário;
- microinterações;
- navegação;
- tipografia;
- hierarquia visual;
- sensação de progresso.

O diferencial competitivo pretendido está principalmente na qualidade dessas experiências.

---

# 38. Próximas Etapas

Com o PRD aprovado, o desenvolvimento do produto deverá seguir aproximadamente esta sequência:

**Etapa 1 — UX**

Definir arquitetura de informação e fluxos definitivos.

**Etapa 2 — UI**

Definir linguagem visual, Home, HabitCard, calendário, detalhes, criação e estados especiais.

**Etapa 3 — Design System**

Definir tipografia, espaçamentos, cores, componentes, estados e interações.

**Etapa 4 — Especificação Técnica**

Definir stack, arquitetura, persistência, entidades, regras de cálculo e organização do projeto.

**Etapa 5 — Modelo de Dados**

Definir Habit, HabitCompletion e demais estruturas necessárias.

**Etapa 6 — Casos de Uso**

Transformar requisitos em comportamentos implementáveis.

**Etapa 7 — Testes e Edge Cases**

Especificar cenários de streak, alteração retroativa, mudança de mês, timezone, exclusão e persistência.

**Etapa 8 — Backlog**

Converter o PRD em épicos, histórias e tarefas pequenas.

**Etapa 9 — Especificação para Codex**

Criar documentação técnica objetiva contendo arquitetura, estrutura de projeto, padrões, regras, componentes e critérios de aceite.

**Etapa 10 — Implementação**

Utilizar as especificações anteriores como fonte de verdade durante a construção do MVP.
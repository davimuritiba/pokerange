# Pokerange 🎮

Um jogo divertido de adivinhação baseado em Pokémon!

## Como Funciona

### Objetivo

Adivinhar qual Pokémon corresponde a um número da Pokédex, ou vice-versa, e ganhar o máximo de pontos possível.

### Modos de Jogo

#### Clássico
- Um número é sorteado
- Você chuta qual Pokémon ele representa
- Quanto mais próximo do Pokémon correto, mais pontos você ganha

#### Invertido
- Um Pokémon é sorteado
- Você chuta o número dele na Pokédex
- Quanto mais próximo do número correto, mais pontos você ganha

### Rodadas

- Cada partida tem **5 rodadas**
- Em cada rodada, um novo número/Pokémon é sorteado
- Você tem que adivinhar corretamente para ganhar pontos

### Sistema de Pontos

- **Máximo por rodada:** 1.000 pontos
- **Acerto exato (#0):** Na mosca! (1.000 pontos)
- **Muito próximo (≥800 pontos):** Quase perfeito!
- **Próximo (≥500 pontos):** Muito perto!
- **Razoável (≥200 pontos):** Nada mal!
- **Longe (≥50 pontos):** Passou longe...
- **Muito longe (<50 pontos):** Muito longe!

Os pontos são calculados de forma exponencial, considerando o tamanho do intervalo escolhido. Intervalos menores (como Gen 1) exigem mais precisão!

### Filtros

Antes de começar, escolha qual intervalo da Pokédex quer jogar:

- **Todas:** Pokédex completa (#0001–#1025)
- **Geração Específica:** Jogue apenas com Pokémon de uma geração (Gen 1, Gen 2, etc.)
- **Múltiplas Gerações:** Combine várias gerações
- **Personalizado:** Escolha um intervalo específico de números

O intervalo deve ter pelo menos 5 Pokémon diferentes.

### Multiplicadores

Quanto **menor** o intervalo, **mais pontos** você ganha por acertos próximos. Por isso, jogar apenas com Gen 1 é mais desafiador que a Pokédex completa!

### Multiplayer

- Jogue **sozinho** ou com **vários jogadores**
- Em multiplayer, cada jogador chuta na sua vez
- Os pontos só aparecem após a rodada ser revelada (para não darem dicas!)
- Placar é atualizado a cada rodada

## Começando

1. Clique em um modo de jogo (Clássico ou Invertido)
2. Escolha um filtro de Pokémon
3. Digite seu nome (opcional)
4. Vença com inteligência e conhecimento Pokémon! 🏆

---

**Dados de** [PokéAPI](https://pokeapi.co)

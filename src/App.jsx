import { useState, useCallback } from 'react'

const TYPE_NAMES_JA = {
  normal: 'ノーマル',
  fire: 'ほのお',
  water: 'みず',
  electric: 'でんき',
  grass: 'くさ',
  ice: 'こおり',
  fighting: 'かくとう',
  poison: 'どく',
  ground: 'じめん',
  flying: 'ひこう',
  psychic: 'エスパー',
  bug: 'むし',
  rock: 'いわ',
  ghost: 'ゴースト',
  dragon: 'ドラゴン',
  dark: 'あく',
  steel: 'はがね',
  fairy: 'フェアリー',
}

// ♀/♂ 記号でタイプが難しいポケモンは除外
const SKIP_IDS = new Set([29, 32])

function hiraganaToKatakana(str) {
  return str.replace(/[\u3041-\u3096]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60)
  )
}

function normalizeAnswer(str) {
  return hiraganaToKatakana(str.trim().replace(/\s/g, ''))
}

async function fetchRandomPokemon() {
  let id
  do {
    id = Math.floor(Math.random() * 151) + 1
  } while (SKIP_IDS.has(id))

  const [pokemonRes, speciesRes] = await Promise.all([
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
    fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
  ])

  if (!pokemonRes.ok || !speciesRes.ok) {
    throw new Error('データの取得に失敗しました')
  }

  const [pokemonData, speciesData] = await Promise.all([
    pokemonRes.json(),
    speciesRes.json(),
  ])

  const jaName =
    speciesData.names.find(n => n.language.name === 'ja-Hrkt')?.name ||
    speciesData.names.find(n => n.language.name === 'ja')?.name ||
    pokemonData.name

  const types = pokemonData.types.map(
    t => TYPE_NAMES_JA[t.type.name] || t.type.name
  )

  return {
    name: jaName,
    types,
    id,
    sprite: pokemonData.sprites.front_default,
  }
}

export default function App() {
  const [screen, setScreen] = useState('start') // 'start' | 'loading' | 'quiz' | 'correct' | 'revealed'
  const [pokemon, setPokemon] = useState(null)
  const [hintLevel, setHintLevel] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [isWrong, setIsWrong] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const loadPokemon = useCallback(async () => {
    setScreen('loading')
    setErrorMsg('')
    try {
      const p = await fetchRandomPokemon()
      setPokemon(p)
      setHintLevel(0)
      setUserAnswer('')
      setIsWrong(false)
      setScreen('quiz')
    } catch {
      setErrorMsg('ネットワークエラーです。もう一度おしてね。')
      setScreen('start')
    }
  }, [])

  const checkAnswer = () => {
    if (!userAnswer.trim()) return
    const normalized = normalizeAnswer(userAnswer)
    const answer = normalizeAnswer(pokemon.name)
    if (normalized === answer) {
      setScreen('correct')
    } else {
      setIsWrong(true)
      setUserAnswer('')
      if (hintLevel < pokemon.name.length - 1) {
        setHintLevel(h => h + 1)
      }
    }
  }

  const addHint = () => {
    if (hintLevel < pokemon.name.length - 1) {
      setHintLevel(h => h + 1)
      setIsWrong(false)
    }
  }

  if (!pokemon && screen === 'quiz') return null

  const isMaxHint = pokemon && hintLevel >= pokemon.name.length - 1
  const shownChars = pokemon ? pokemon.name.substring(0, hintLevel + 1) : ''

  // ======== スタート画面 ========
  if (screen === 'start' || screen === 'loading') {
    return (
      <div className="container">
        <div className="card start-card">
          <div className="pokeball">
            <div className="pokeball-top" />
            <div className="pokeball-center" />
            <div className="pokeball-bottom" />
          </div>
          <h1 className="title">
            ポケモン
            <br />
            クイズ
          </h1>
          <p className="subtitle">
            ポケモンの なまえを
            <br />
            あてよう！
          </p>
          {errorMsg && <p className="error-msg">{errorMsg}</p>}
          <button
            className="btn btn-start"
            onClick={loadPokemon}
            disabled={screen === 'loading'}
          >
            {screen === 'loading' ? 'よみこみちゅう...' : 'スタート！'}
          </button>
        </div>
      </div>
    )
  }

  // ======== せいかい画面 ========
  if (screen === 'correct') {
    return (
      <div className="container">
        <div className="card result-card">
          <p className="result-stars">⭐ ⭐ ⭐</p>
          <h2 className="correct-title">せいかい！！</h2>
          {pokemon.sprite && (
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              className="pokemon-sprite"
            />
          )}
          <p className="pokemon-name-big">{pokemon.name}</p>
          <p className="result-sub">だよ！ すごい！</p>
          <button className="btn btn-next" onClick={loadPokemon}>
            つぎのポケモン！ →
          </button>
        </div>
      </div>
    )
  }

  // ======== こたえを みる画面 ========
  if (screen === 'revealed') {
    return (
      <div className="container">
        <div className="card result-card">
          <h2 className="reveal-title">こたえは...</h2>
          {pokemon.sprite && (
            <img
              src={pokemon.sprite}
              alt={pokemon.name}
              className="pokemon-sprite"
            />
          )}
          <p className="pokemon-name-big">{pokemon.name}</p>
          <p className="result-sub">だよ！ つぎは がんばろう！</p>
          <button className="btn btn-next" onClick={loadPokemon}>
            つぎのポケモン！ →
          </button>
        </div>
      </div>
    )
  }

  // ======== クイズ画面 ========
  return (
    <div className="container">
      <div className="card quiz-card">
        <h2 className="hint-title">ヒント</h2>

        <div className="hint-box">
          <div className="hint-row">
            <span className="hint-tag">タイプ</span>
            <span className="hint-value">{pokemon.types.join(' ・ ')}</span>
          </div>
          <div className="hint-row">
            <span className="hint-tag">なまえ</span>
            <span className="hint-value hint-chars">
              {shownChars}
              {!isMaxHint && <span className="dots">・・・</span>}
            </span>
          </div>
        </div>

        {isWrong && (
          <div className="wrong-msg" key={hintLevel}>
            ❌ ちがうよ！ もう1かい！
          </div>
        )}

        <input
          type="text"
          className="answer-input"
          value={userAnswer}
          onChange={e => {
            setUserAnswer(e.target.value)
            if (isWrong) setIsWrong(false)
          }}
          onKeyDown={e => e.key === 'Enter' && checkAnswer()}
          placeholder="こたえをいれてね"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        <div className="btn-row">
          <button className="btn btn-answer" onClick={checkAnswer}>
            こたえる！
          </button>
          {isMaxHint ? (
            <button
              className="btn btn-reveal"
              onClick={() => setScreen('revealed')}
            >
              こたえを みる
            </button>
          ) : (
            <button className="btn btn-hint" onClick={addHint}>
              ヒント！
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

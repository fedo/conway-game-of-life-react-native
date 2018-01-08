import moment from 'moment'
import {Button, Text, View, StatusBar} from 'react-native'
import {assocPath, contains, map, range} from 'ramda'
import React, {Component} from 'react'
import {getNeighbours, universe, evolve} from 'conway-game-of-life-js'

const CYCLES = 1000
const DELAY = 100

const getCellStyle = (perc, alive) => ({
  height: 1,
  paddingBottom: `${perc}%`,
  borderColor: "black",
  borderWidth: 1,
  flex: 1,
  backgroundColor: alive ? "#4CAF50" : "#424242"
})

class Cell extends Component {
  render() {
    const {alive, position, size, neighbours, counterMap} = this.props
    const [x, y] = position
    const [width, height] = size
    const perc = 100 / width
    return (
      <View
        key={`${x}-${y}`}
        className={`Cell-${x}-${y}`}
        style={getCellStyle(perc, alive)}>
        {/*<Text>{`${x}-${y}`}</Text>*/}
        {/*<Text>{counterMap.get(List([x, y]))}</Text>*/}
      </View>
    )
  }
}

const UniverseStyle = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  borderColor: "black",
  borderWidth: 1,
  backgroundColor: "#424242"
}

const RowStyle = {
  flexDirection: "row"
}

class Universe extends Component {
  render() {
    const [width, height] = this.props.universe.size
    const {cells, size} = this.props.universe
    const allCells = map((x) => {
      return map((y) => {
        return [x, y]
      }, range(0, height))
    }, range(0, width))

    return (
      <View className="Universe" style={UniverseStyle}>
        {
          allCells.map((row) => {
            const rowId = "" + row[0][0]
            return (
              <View
                key={rowId}
                className={`Row-${rowId}`}
                style={RowStyle}>
                {row.map(([x, y]) => {
                  const alive = contains([x, y], cells)
                  return <Cell
                    key={`${x}-${y}`}
                    position={[x, y]}
                    size={size}
                    alive={alive}
                    neighbours={getNeighbours([x, y], this.props.universe)}
                  />
                })}
              </View>
            )
          })
        }
      </View>
    )
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      autoEvolveId: undefined,
      universe,
      benchmark: {
        result: undefined
      }
    }
  }

  onClickEvolve = () => {
    this.setState((state) => ({
      ...state,
      universe: evolve(state.universe)
    }))
  }

  onClickBenchmark = () => {
    const start = moment()
    for (let n = 0; n < CYCLES; n++) {
      this.onClickEvolve()
    }
    this.setState((state) => {
      const end = moment()
      return assocPath(['benchmark', 'result'], end.diff(start, 'milliseconds'), state)
    })
  }

  onToggleAutoEvolve = () => {
    this.setState((state) => {
      const {autoEvolveId} = state
      return {
        ...state,
        autoEvolveId: autoEvolveId
          ? clearInterval(autoEvolveId)
          : setInterval(() => this.onClickEvolve(), DELAY)
      }
    })
  }

  render() {
    return (
      <View className="App">
        <StatusBar
          hidden={true}
        />
        <Universe universe={this.state.universe}/>
        {!this.state.autoEvolveId &&
        <Button
          title={"Evolve"}
          onPress={this.onClickEvolve}>
        </Button>
        }
        <Button
          title={this.state.autoEvolveId ? "Stop" : "Auto"}
          onPress={this.onToggleAutoEvolve}>
        </Button>
        <Button
          title="Benchmark"
          onPress={this.onClickBenchmark}>
        </Button>
        {this.state.benchmark.result
        && <Text>Result: {`${this.state.benchmark.result || ''}ms`}</Text>}
      </View>
    )
  }
}

export default App

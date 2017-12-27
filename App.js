import React, {Component} from 'react'
import {getNeighbours, universe, evolve, counterMap$} from './game-of-life'
import {map, range, contains} from 'ramda'
import {List} from 'immutable'
import { Button, Text, View } from 'react-native';

const getCellStyle = (perc, alive) => ({
  height: 10,
  paddingBottom: `${perc}%`,
  // width: `${perc}%`,
  border: "1px solid black",
  flex: 1,
  width: 30,
  // margin: "-1px",
  backgroundColor: alive ? "#4CAF50" : "white"
})

class Cell extends Component {
  render() {
    const {alive, position, size, neighbours, counterMap} = this.props
    const [x, y] = position
    const [width, height] = size
    const perc = 100 / width
    return (
      <Text
        key={`${x}-${y}`}
        className={`Cell-${x}-${y}`}
        style={getCellStyle(perc, alive)}>
        {`${x}-${y}`}
        <View style={{width: 10, height: 10}}>
          <Text>{counterMap.get(List([x, y]))}</Text>
        </View>
      </Text>
    )
  }
}

const UniverseStyle = {
  display: "flex",
  flexDirection: "row",
  width: "100%",
  // maxWidth: "80vh",
  // maxHeight: "80wh",
  backgroundColor: "#424242"
}

const RowStyle = {
  flexDirection: "column"
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
        <Text>Universe</Text>
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
                    counterMap={counterMap$(this.props.universe)}
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
      universe
    }
  }

  onClickEvolve = () => {
    this.setState((state) => ({
      ...state,
      universe: evolve(state.universe)
    }))
  }

  onToggleAutoEvolve = () => {
    this.setState((state) => {
      const {autoEvolveId} = state
      return {
        ...state,
        autoEvolveId: autoEvolveId
          ? clearInterval(autoEvolveId)
          : setInterval(() => this.onClickEvolve(), 500)
      }
    })
  }

  render() {
    return (
      <View className="App">
        <Text>"game of life"</Text>
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
      </View>
    )
  }
}

export default App

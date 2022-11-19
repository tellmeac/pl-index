import React, { useEffect, useState } from 'react';
import './App.css'

const baseUrl = 'http://localhost:8080/api'

interface Item {
  name: string
  absPath: string
  isDir: boolean
}

interface Index {
  path: string
  content: Item[]
}

async function fetchIndex(path: string): Promise<Index> {
  return fetch(`${baseUrl}/index?path=${path}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  }).then(resp => {
    return resp.json()
  })
}

async function removeItem(path: string): Promise<void> {
  fetch(`${baseUrl}/remove?path=${path}`, {
    method: 'DELETE',
  }).then(r => {
    if (r.ok) {
      return
    }

    throw new Error(`Failed to remove item`)
  }).catch(err => {
    alert(err)
  })
}

function App() {
  const initialDir = '.'
  const [currentDir, setCurrentDir] = useState(initialDir)
  const [travelHistory, updateHistory] = useState<string[]>([])
  const [items, setItems] = useState<Item[]>([]);

  const updateIndex = (dir: string) => {
    fetchIndex(dir).then(index => {
      setCurrentDir(index.path)
      setItems(index.content)
    })
  }

  useEffect(() => {
    updateIndex(currentDir)
  }, [])

  const goBackAction = () => {
    const backPath = travelHistory.at(-1) || initialDir
    updateIndex(backPath)
    setCurrentDir(backPath)
    updateHistory(history => {
      history.pop()
      return history
    })
  }

  return (
    <div className="App">
      <h1
        onClick={goBackAction}
      >
        CWD: {currentDir}
      </h1>
      <p>
        Click on name to navigate, click on selected working directory to go back!
      </p>
      {items.length > 0 ?
        items.map(item => {
          const nav = () => {
            if (!item.isDir) {
              alert(`${item.name} is not a directory!`)
              return
            }

            updateIndex(item.absPath)
            updateHistory([...travelHistory, currentDir])
          }

          const remove = () => {
            if (!window.confirm(`Are you sure to remove ${item.name} ?`)) {
              return
            }

            removeItem(item.absPath).then()
            setItems(items.filter(i => i.absPath !== item.absPath))
          }

          return <ItemComponent key={item.name} item={item} navigate={nav} remove={remove} />
        }) : <p>Dir is empty</p>
      }
    </div>
  );
}

const ItemComponent: React.FC<{ item: Item, navigate: () => void, remove: () => void }> = ({ item, navigate, remove }) => {
  return <div>
    <span style={{
      color: !item.isDir ? 'gray' : 'black'
    }}
      onClick={navigate}
    >
      {item.name}
    </span>
    <svg onClick={remove} className="svg-icon" viewBox="0 0 20 20">
      <path d="M10.185,1.417c-4.741,0-8.583,3.842-8.583,8.583c0,4.74,3.842,8.582,8.583,8.582S18.768,14.74,18.768,10C18.768,5.259,14.926,1.417,10.185,1.417 M10.185,17.68c-4.235,0-7.679-3.445-7.679-7.68c0-4.235,3.444-7.679,7.679-7.679S17.864,5.765,17.864,10C17.864,14.234,14.42,17.68,10.185,17.68 M10.824,10l2.842-2.844c0.178-0.176,0.178-0.46,0-0.637c-0.177-0.178-0.461-0.178-0.637,0l-2.844,2.841L7.341,6.52c-0.176-0.178-0.46-0.178-0.637,0c-0.178,0.176-0.178,0.461,0,0.637L9.546,10l-2.841,2.844c-0.178,0.176-0.178,0.461,0,0.637c0.178,0.178,0.459,0.178,0.637,0l2.844-2.841l2.844,2.841c0.178,0.178,0.459,0.178,0.637,0c0.178-0.176,0.178-0.461,0-0.637L10.824,10z"></path>
    </svg>
  </div>
}

export default App;

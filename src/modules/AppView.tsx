import React, {useEffect, useState} from "react";
import styled from "@emotion/styled";

const storagePrefix = 'repeater-items'

// If someone else is using this, just modify this list to make it non-salsa specific
const listItems = {
    'on-1-moves': 'On 1 - Moves',
    'on-1-combos': 'On 1 - Combos',
    'on-1-everything': 'On 1 - Everything',
    'on-2-moves': 'On 2 - Moves',
    'on-2-combos': 'On 2 - Combos',
    'on-2-everything': 'On 2 - Everything',
}

const defaultListName = Object.keys(listItems)[0]
const defaultPeriod = 7000

export default function AppView() {

    const [listName, setListName] = useState(defaultListName)
    const [text, setText] = useState("")
    const [period, setPeriod] = useState(defaultPeriod as number)
    const [isTimerEnabled, setIsTimerEnabled] = useState(false)
    const [intervalId, setIntervalId] = useState(0 as any)

    useEffect(() => {
        setIsTimerEnabled(false)

        const storedText = window.localStorage.getItem(getTextStorageKey()) || ""
        updateText(storedText)

        const storedPeriod = +(window.localStorage.getItem(getPeriodStorageKey()) || defaultPeriod)
        setPeriod(storedPeriod)
    }, [listName])

    useEffect(() => {
        if (isTimerEnabled) {
            sayRandomWord()
            setIntervalId(setInterval(() => sayRandomWord(), period))
        } else {
            clearInterval(intervalId)
            setIntervalId(0)
        }
    }, [isTimerEnabled])

    const listItemsView = Object.keys(listItems).map(listItemKey =>
        <option
            key={listItemKey}
            value={listItemKey}
        >
            {(listItems as any)[listItemKey]}
        </option>
    )

    return <Root>
        <Main>
            <Page>
                <select onChange={e => handleListChange(e.target.value)} value={listName}>
                    {listItemsView}
                </select>
                <ItemView onChange={e => updateText(e.target.value)} value={text} />
                <input type="number" min="100" value={period} onChange={e => handlePeriodChange(e.target.value as any)} />
                <button onClick={toggleSayingRandomWords}>
                    {isTimerEnabled && "Stop"}
                    {!isTimerEnabled && "Start"}
                </button>
            </Page>
        </Main>
    </Root>

    function handleListChange(listName: string) {
        setListName(listName)
    }

    function handlePeriodChange(period: number) {
        console.log("Period change: " + period)
        setPeriod(period)
        window.localStorage.setItem(getPeriodStorageKey(), period + "")
    }

    function say(item: string) {
        console.log('saying item', item)

        if ('speechSynthesis' in window) {
            const synthesis = window.speechSynthesis;

            // Create an utterance object
            const utterance = new SpeechSynthesisUtterance(item);

            // Speak the utterance
            synthesis.speak(utterance);
        } else {
            console.log('Text-to-speech not supported.');
        }
    }

    function sayRandomWord() {
        const item = getRandomWord()
        say(item)
    }

    function toggleSayingRandomWords() {
        if (isTimerEnabled) {
            setIsTimerEnabled(false)
        } else {
            setIsTimerEnabled(true)
        }
    }

    function getRandomWord() {
        const items = textToItems()
        return items[Math.floor(Math.random()*items.length)]
    }

    function updateText(nextText: string) {
        setText(nextText)
        window.localStorage.setItem(getTextStorageKey(), nextText)
    }

    function textToItems() {
        return text.split('\n')
    }

    function getTextStorageKey() {
        return `${storagePrefix}-${listName}`
    }

    function getPeriodStorageKey() {
        return `${storagePrefix}-${listName}-period`
    }
}

const Root = styled.div`
display: flex;
flex-direction: column;
min-height: 100vh;
`

const Main = styled.main`
display: flex;
flex-direction: column;
flex: 1;
margin: 0 1rem;
`

const Page = styled.div`
display: block;
margin: auto;
max-width: 600px;
width: 100%;
position: relative;
`

const ItemView = styled.textarea`
height: 400px;
width: 100%;
display: block;
`

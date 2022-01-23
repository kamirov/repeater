import React, {useEffect, useState} from "react";
import styled from "@emotion/styled";

const storagePrefix = 'repeater-items'

// TODO: Combine styles and lists. They're basically the same thing and I'm just lazily duplicating code

// If someone is using this for other styles, just add them to this object
const styleItems = {
    salsa: 'Salsa',
    salsaSolo: 'Salsa (Solo)',
    shuffling: 'Shuffling',
    dominican: 'Dominican',
    kizomba: 'Kizomba',
    dominicanSolo: 'Dominican (Solo)',
    bachata: 'Bachata',
    hiphop: 'Hip Hop',
}

const allKey = 'all'
const tempKey = 'temp'
const listItems = {
    moves: 'Moves',
    combos: 'Combos',
    [allKey]: 'Everything',
    [tempKey]: 'Temporary'
}

const defaultStyleNameKey = Object.keys(styleItems)[0]
const defaultListNameKey = Object.keys(listItems)[0]
const defaultPeriod = 7000

export default function AppView() {

    const [styleNameKey, setStyleNameKey] = useState(defaultStyleNameKey)
    const [listNameKey, setListNameKey] = useState(defaultListNameKey)
    const [text, setText] = useState("")
    const [period, setPeriod] = useState(defaultPeriod as number)
    const [isTimerEnabled, setIsTimerEnabled] = useState(false)
    const [intervalId, setIntervalId] = useState(0 as any)

    useEffect(() => {
        setIsTimerEnabled(false)

        let storedText

        if (listNameKey === allKey) {
            storedText = Object.keys(listItems)
                .filter(key => key !== allKey)
                .filter(key => key !== tempKey)
                .reduce((runningText, currentListKey) => {
                    const currentText = window.localStorage.getItem(getTextStorageKey(styleNameKey, currentListKey))
                    if (currentText) {
                        return runningText + '\n' + currentText
                    }
                    return runningText
                }, "")
        } else {
            storedText = window.localStorage.getItem(getTextStorageKey(styleNameKey, listNameKey)) || ""
        }

        updateText(sanitizeText(storedText))

        const storedPeriod = +(window.localStorage.getItem(getPeriodStorageKey(styleNameKey, listNameKey)) || defaultPeriod)
        setPeriod(storedPeriod)
    }, [styleNameKey, listNameKey])

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

    const styleItemsView = Object.keys(styleItems).map(styleItemKey =>
        <option
            key={styleItemKey}
            value={styleItemKey}
        >
            {(styleItems as any)[styleItemKey]}
        </option>
    )

    const onTextChangeHandler = listNameKey !== allKey ?
        (e: any) => updateText(e.target.value) : undefined

    return <Root>
        <Main>
            <Page>
                <select onChange={e => handleStyleChange(e.target.value)} value={styleNameKey}>
                    {styleItemsView}
                </select>
                <select onChange={e => handleListChange(e.target.value)} value={listNameKey}>
                    {listItemsView}
                </select>
                <ItemView onChange={onTextChangeHandler} onBlur={handleBlur} value={text} disabled={listNameKey === allKey} />
                <input type="number" min="100" value={period} onChange={e => handlePeriodChange(e.target.value as any)} />
                <button onClick={toggleSayingRandomWords} disabled={!text}>
                    {isTimerEnabled && "Stop"}
                    {!isTimerEnabled && "Start"}
                </button>
            </Page>
        </Main>
    </Root>

    function handleBlur() {
        updateText(sanitizeText(text))
    }

    function handleListChange(newlistNameKey: string) {
        setIsTimerEnabled(false)
        setListNameKey(newlistNameKey)
    }

    function handleStyleChange(newStyleNameKey: string) {
        setIsTimerEnabled(false)
        setStyleNameKey(newStyleNameKey)
    }

    function handlePeriodChange(period: number) {
        setIsTimerEnabled(false)
        setPeriod(period)
        window.localStorage.setItem(getPeriodStorageKey(styleNameKey, listNameKey), period + "")
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
            alert('Text-to-speech not supported.');
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
        setIsTimerEnabled(false)
        setText(nextText)
        window.localStorage.setItem(getTextStorageKey(styleNameKey, listNameKey), nextText)
    }

    function textToItems() {
        return text.split('\n')
    }

}

function sanitizeText(text: string) {
    return text.toLowerCase().split("\n").filter(item => item).sort().join("\n");
}

function getTextStorageKey(styleNameKey: string, listNameKey: string) {
    return `${storagePrefix}-${styleNameKey}-${listNameKey}`
}

function getPeriodStorageKey(styleNameKey: string, listNameKey: string) {
    return `${getTextStorageKey(styleNameKey, listNameKey)}-period`
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

import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {Provider} from "react-redux";
import {CssBaseline} from "@material-ui/core";
import {BrowserRouter} from "react-router-dom";
import store from "./redux/store";
import {HTML5Backend} from "react-dnd-html5-backend";
import {DndProvider} from "react-dnd";
ReactDOM.render(
    <Provider store={store}>
        <CssBaseline/>
        <BrowserRouter>
            <DndProvider backend={HTML5Backend}>
                <App/>
            </DndProvider>
        </BrowserRouter>
    </Provider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

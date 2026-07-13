import { mount } from 'svelte'
import App from './App.svelte'
import '@lightbox-gallery/core/styles.css'
import './style.css'

mount(App, { target: document.getElementById('app')! })

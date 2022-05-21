import {Move} from "../move/move.types";

export const AnnouncementService = {
    announce,
}

function announce(moves: Move[]) {
    const moveNames = moves.map(m => m.name)

    let message = moveNames.join(', then ')

    console.log(`Announcing "${message}"`)

    if ('speechSynthesis' in window) {
        const synthesis = window.speechSynthesis;

        // Create an utterance object
        const utterance = new SpeechSynthesisUtterance(message);

        // Set language (if device has another set)
        utterance.lang = 'en-US';

        // Speak the utterance
        synthesis.speak(utterance);
    } else {
        console.error('Text-to-speech not supported.');
    }

}

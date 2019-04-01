import React from 'react';
import VoiceAnalyzer from './voice_analyse';
import { WaveformVisualizer, CircularVisualizer } from './visualizer';

const voiceAnalyzer = new VoiceAnalyzer();
const waveformVisualizer = new WaveformVisualizer(document.getElementById('canvas') as HTMLCanvasElement);
const circularVisualizer = new CircularVisualizer(document.getElementById('canvas2') as HTMLCanvasElement);
voiceAnalyzer.addVisualizer(waveformVisualizer);
voiceAnalyzer.addVisualizer(circularVisualizer);

const Buttons = (): JSX.Element => {
    return <>
        <div className="select">
            <label htmlFor="audioSource">Audio source: </label><select id="audioSource"></select>
        </div>
        <button onClick={() => voiceAnalyzer.startRecording()}>start analysis</button>
        <button onClick={() => voiceAnalyzer.endRecording()}>stop analysis</button>
        <button onClick={() => circularVisualizer.toSharp()}>♯Key(DoReMi)</button>
        <button onClick={() => circularVisualizer.toFlat()}>♭Key(DoReMi)</button>
        <button onClick={() => circularVisualizer.toGermanSharp()}>♯Key(German)</button>
        <button onClick={() => circularVisualizer.toGermanFlat()}>♭Key(German)</button>
        <button onClick={() => circularVisualizer.toMono()}>blackWhite</button>
        <button onClick={() => voiceAnalyzer.toFilter0()}>no filter</button>
        <button onClick={() => voiceAnalyzer.toFilter1()}>melody filter</button>
        <button onClick={() => voiceAnalyzer.toFilter5()}>chord filter</button>
        <button onClick={() => voiceAnalyzer.adjust()}>shift one note</button>
    </>;
};

const Pitch = (): JSX.Element => {
    const pitch = [
        { name: 'C♭', relative: -1 },
        { name: 'G♭', relative: -6 },
        { name: 'D♭', relative: 1 },
        { name: 'A♭', relative: -4 },
        { name: 'E♭', relative: 3 },
        { name: 'B♭', relative: -2 },
        { name: 'F', relative: 5 },
        { name: 'C', relative: 0 },
        { name: 'G', relative: -5 },
        { name: 'D', relative: 2 },
        { name: 'A', relative: -3 },
        { name: 'E', relative: 4 },
        { name: 'B', relative: -1 },
        { name: 'F♯', relative: 6 },
        { name: 'C♯', relative: 1 },
    ];

    return <>
        <button onClick={() => voiceAnalyzer.toDefinite()}>Absolute Pitch</button>
        <p>Relative Pitch in:</p>
        {pitch.map(each =>
            <button key={each.name} onClick={() => voiceAnalyzer.toRelative(each.relative)}>{each.name}</button>
        )}
    </>;
};

const App = (): JSX.Element => {
    return <>
        <Buttons />
        <hr />
        <Pitch />
        <hr />
    </>;
};

export default App;

import React from 'react';

//@ts-ignore
import * as v from './voice_analyse';

const Buttons = (): JSX.Element => {
  return <>
    <div className="select">
      <label htmlFor="audioSource">Audio source: </label><select id="audioSource"></select>
    </div>
    <button onClick={v.startRecording}>start analysis</button>
    <button onClick={v.endRecording}>stop analysis</button>
    <button onClick={v.toSharp}>♯Key(DoReMi)</button>
    <button onClick={v.toFlat}>♭Key(DoReMi)</button>
    <button onClick={v.toGermanSharp}>♯Key(German)</button>
    <button onClick={v.toGermanFlat}>♭Key(German)</button>
    <button onClick={v.toMono}>blackWhite</button>
    <button onClick={v.toFilter0}>no filter</button>
    <button onClick={v.toFilter1}>melody filter</button>
    <button onClick={v.toFilter5}>chord filter</button>
    <button onClick={v.adjust}>shift one note</button>
  </>;
};

const Pitch = (): JSX.Element => {
  return <>
    <button onClick={v.toDefinite}>Absolute Pitch</button>
    <p>Relative Pitch in:</p>
    <button onClick={v.toRelativeCFlat}>C♭</button>
    <button onClick={v.toRelativeGFlat}>G♭</button>
    <button onClick={v.toRelativeDFlat}>D♭</button>
    <button onClick={v.toRelativeAFlat}>A♭</button>
    <button onClick={v.toRelativeEFlat}>E♭</button>
    <button onClick={v.toRelativeBFlat}>B♭</button>
    <button onClick={v.toRelativeF}>F</button>
    <button onClick={v.toRelativeC}>C</button>
    <button onClick={v.toRelativeG}>G</button>
    <button onClick={v.toRelativeD}>D</button>
    <button onClick={v.toRelativeA}>A</button>
    <button onClick={v.toRelativeE}>E</button>
    <button onClick={v.toRelativeB}>B</button>
    <button onClick={v.toRelativeFSharp}>F♯</button>
    <button onClick={v.toRelativeCSharp}>C♯</button>
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

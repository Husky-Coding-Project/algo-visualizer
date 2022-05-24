/**
 * The page for binary search
 */

import React, { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./BinarySearch.css";
import Controls from "../../components/Controls";
import Array1D from "../../components/Array1D";
import StepTracker from "../../components/StepTracker";
import { useDispatch, useSelector } from "react-redux";
import { resetSteps, updateAlgorName } from "../../redux/stateSlice";
import VisualizerContainer from "../../components/VisualizerContainer";

const ALGORITHM_URL = "searches/binarysearch/";
const ALGORITHM_NAME = "Binary Search";

const BinarySearch = () => {
    const algorSteps = useSelector((state) => state.global.algorSteps);
    const currentStep = useSelector((state) => state.global.currentStep);
    const array = useSelector((state) => state.global.array);
    const inputBoxRef = useRef();

    const [numInput, setNumInput] = useState("");
    const [currentTarget, setCurrentTarget] = useState("");

    const dispatch = useDispatch();
    // reset data upon exiting the page
    useEffect(() => {
        // update the name on first load
        dispatch(updateAlgorName(ALGORITHM_NAME));

        return () => {
            dispatch(resetSteps());
        };
    }, []);

    // function that update input box
    const updateTargetBoxValue = (e) => {
        inputBoxRef.current.value = e.target.innerHTML;
        setNumInput(e.target.innerHTML);
    };

    /**
     * Decide how to draw blocks on the array.
     * Use by passing to the Array1D or any other visual components.
     *
     * We expect the json returned from the backend to include an
     * array of steps and a success flag.
     *
     * Each step also contains a description to describe the step,
     * used for the logger.
     *
     * For binary search, each step object includes the left and right bound of search.
     *
     * algorSteps.steps[i] =
     *                          {
     *                              step: index of focused element at step i
     *                              l: index of left bound
     *                              r: index of right bound
     *                          }
     *
     * @returns react components
     */
    const drawBlocks = () => {
        let steps = algorSteps.steps;
        let currentArrayStep = currentStep - 1;
        // react can try to render before the backend return the steps (when page first loaded)
        // so a guard is necessary
        let currentHighlightId = steps[currentArrayStep]
            ? steps[currentArrayStep].step
            : undefined;

        // for each element in the array
        return array.map((value, id) => {
            // first decide the highlight style for the element
            let style = "";
            // undefined guard
            if (currentHighlightId !== undefined) {
                // highlight if the current element is in the searching bound
                if (
                    id >= steps[currentArrayStep].l &&
                    id <= steps[currentArrayStep].r
                ) {
                    style = " highlight-domain ";
                }

                // highlight if the current element is focused
                // overwrites the previous style
                if (currentHighlightId === id) {
                    style = " highlight";
                }
                // the end of the search is marked as -1
                else if (
                    currentArrayStep !== 0 &&
                    id === steps[currentArrayStep - 1].step &&
                    currentHighlightId === -1
                ) {
                    style = algorSteps.success
                        ? " highlight-success"
                        : " highlight-error";
                }
            }
            // return a react component
            return (
                <td
                    className={"value-block" + style}
                    key={id}
                    id={id}
                    onClick={updateTargetBoxValue.bind(this)}
                >
                    {value}
                </td>
            );
        });
    };

    return (
        <div className="content">
            <div className="centered">
                <h2>{ALGORITHM_NAME}</h2>
            </div>
            {/*
                <div className="info">
                    <button className="btn">Extra Info right here</button>
                </div>
                */}

            <VisualizerContainer>
                <Array1D drawBlocks={drawBlocks} />
            </VisualizerContainer>

            <StepTracker />

            <div className="centered">Current target: {currentTarget}</div>
            <div className="input-container">
                <input
                    ref={inputBoxRef}
                    className="num-input"
                    type="number"
                    placeholder="Search for"
                    value={numInput}
                    onChange={(e) => {
                        setNumInput(e.target.value);
                    }}
                ></input>
            </div>

            <Controls
                requestSortedArray={true}
                algorithmUrl={ALGORITHM_URL}
                numInput={numInput}
                setCurrentTarget={setCurrentTarget}
            />
        </div>
    );
};

export default BinarySearch;

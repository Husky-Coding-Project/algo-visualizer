import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./InsertionSort.css";
import Controls from "../../components/Controls";
import Array1D from "../../components/Array1D";
import AlgoFetcher from "../../apis/AlgoFetcher";
import StepTracker from "../../components/StepTracker";
import VisualizerContainer from "../../components/VisualizerContainer";
import { animated, Transition } from "react-spring";
import { useSelector, useDispatch } from "react-redux";
import {
    updateAlgorSteps,
    resetSteps,
    updateAlgorName,
} from "../../redux/stateSlice";

const ALGORITHM_URL = "sorts/insertionsort/";
const ALGORITHM_NAME = "Insertion Sort";

const InsertionSort = () => {
    const algorSteps = useSelector((state) => state.global.algorSteps);
    const currentStep = useSelector((state) => state.global.currentStep);
    const prevStep = useSelector((state) => state.global.prevStep);
    const array = useSelector((state) => state.global.array);
    const dispatch = useDispatch();

    // swaps[i] is the boolean if a swap is happening at step i
    const [swaps, setSwaps] = useState([]);

    // reset data upon exiting the page
    useEffect(() => {
        // update the name on first load
        dispatch(updateAlgorName(ALGORITHM_NAME));

        return () => {
            dispatch(resetSteps());
        };
    }, []);

    // slightly different from the prototype: update swap count after receiving
    // response from backend
    const doAlgorithm = async (arr) => {
        let data = { array: arr };

        try {
            let response = await AlgoFetcher.post(ALGORITHM_URL, data);
            // update swap
            let c = 0;
            let s = [];
            for (let i = 0; i < response.data.result.steps.length; i++) {
                c += response.data.result.steps[i].swapped ? 1 : 0;
                s.push(c);
            }
            s[-1] = 0;
            setSwaps(s);
            dispatch(updateAlgorSteps({ algorSteps: response.data.result }));
        } catch (err) {
            console.log(err);
        }
    };

    /**
     * Decide how to draw blocks on the array.
     * Use by passing to the Array1D or any other visual components.
     *
     * We expect the json returned from the backend to include an
     * array of steps.
     *
     * Each step also contains a description to describe the step,
     * used for the logger.
     *
     * For insertion sort, each step includes the following:
     *
     * algorSteps.steps[i] =
     *                          {
     *                              array(Array): array of indexes. the state of the entire array at the ith step
     *                              highlight(Array): the indexes of elements that are currently focused
     *                              sorted(Array): the indexes of elements that are sorted
     *                              swapped(Bool): mark if the ith step is swapping two elements
     *                              swapCount(Number): the count of total swaps up to step ith
     *                          }
     *
     * @returns react components
     */
    const drawBlocks = () => {
        // when page loaded at first or in case steps are missing
        let isStepAvailable =
            // the steps are loaded
            algorSteps.steps.length > 0 &&
            // if the algorithm is in progress (step 0: default state)
            currentStep > 0 &&
            // if the steps are in the correct format
            algorSteps.steps[0].highlight != null;

        if (isStepAvailable) {
            var steps = algorSteps.steps;
            var currentArrayStep = currentStep - 1;
            var arr = steps[currentArrayStep].array;
            var highlight = steps[currentArrayStep].highlight;
            var swapped = steps[currentArrayStep].swapped;
            var sorted = steps[currentArrayStep].sorted;
        } else {
            // default array from contianing numbers from 0 to array.length - 1
            arr = [...Array(array.length).keys()];
        }
        // for each element in the array at the current step
        return array.map((value, id) => {
            var style = "";
            if (isStepAvailable) {
                if (highlight.includes(id)) {
                    style = swapped ? " highlight-error" : " highlight";
                } else if (sorted.includes(id)) {
                    style = " highlight-success";
                } else {
                    style = " highlight-domain";
                }
            }
            let m = arr.indexOf(id) - id;
            let prev =
                isStepAvailable && prevStep - 1 >= 0
                    ? steps[prevStep - 1].array.indexOf(id) - id
                    : 0;

            return (
                <Transition
                    items={value}
                    // default value is 170/26
                    config={{
                        tension: 170 * 1.5,
                        friction: 26,
                    }}
                    enter={{ transform: prev }}
                    update={{ transform: m }}
                    key={"t" + id * id}
                >
                    {({ transform }) => {
                        return (
                            <animated.td
                                className={"value-block" + style}
                                key={id}
                                id={id}
                                style={{
                                    transform: transform
                                        .to({
                                            range: [prev, m],
                                            output: [prev * 58, m * 58],
                                        })
                                        .to((x) => `translate3d(${x}px, 0, 0)`),
                                }}
                            >
                                {value}
                            </animated.td>
                        );
                    }}
                </Transition>
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

            <div className="swap-counter-container">
                <span>
                    Swaps:{" "}
                    {swaps[currentStep - 1] != null
                        ? swaps[currentStep - 1]
                        : 0}
                </span>
            </div>

            <StepTracker></StepTracker>

            <Controls doAlgorithm={doAlgorithm} algorithmUrl={ALGORITHM_URL} />
        </div>
    );
};

export default InsertionSort;

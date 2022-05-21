import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import "./SelectionSort.css";
import Controls from "../../components/Controls";
import Array1D from "../../components/Array1D";
import AlgoFetcher from "../../apis/AlgoFetcher";
import StepTracker from "../../components/StepTracker";
import { animated, Transition } from "react-spring";
import { useSelector, useDispatch } from "react-redux";
import { updateAlgorSteps, resetSteps } from "../../redux/stateSlice";
import AlgorithmPopover from "../../components/AlgorithmPopover";

const algorithmUrl = "sorts/selectionsort/";

const SelectionSort = () => {
    const algorSteps = useSelector((state) => state.global.algorSteps);
    const currentStep = useSelector((state) => state.global.currentStep);
    const prevStep = useSelector((state) => state.global.prevStep);
    const array = useSelector((state) => state.global.array);
    const dispatch = useDispatch();

    // swaps[i] is the boolean if a swap is happening at step i
    const [swaps, setSwaps] = useState([]);

    // reset data upon exiting the page
    useEffect(() => {
        return () => {
            dispatch(resetSteps());
        };
    }, []);

    // slightly different from the prototype: update swap count after receiving
    // response from backend
    const doAlgorithm = async (arr) => {
        let data = { array: arr };

        try {
            let response = await AlgoFetcher.post(algorithmUrl, data);
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
     * array of steps and a success flag.
     *
     * Each step also contains a description to describe the step,
     * used for the logger.
     *
     * For bubble sort, each step includes the following:
     *
     * algorSteps.steps[i] =
     *                          {
     *                              array(Array):  array of indexes. the state of the entire array at the ith step
     *                              highlight(Array): the indexes of elements that are currently focused
     *                              sorted(Array): the indexes of elements that are sorted
     *                              swapped(Bool): mark if the ith step is swapping two elements
     *                              swapCount(Number): the count of total swaps up to step ith
     *                              min(Number): the index of the minimum value at step ith
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
            algorSteps.steps[0].highlight != null &&
            algorSteps.steps[0].min != null;

        if (isStepAvailable) {
            var steps = algorSteps.steps;
            var currentArrayStep = currentStep - 1;
            var arr = steps[currentArrayStep].array;
            var highlight = steps[currentArrayStep].highlight;
            var swapped = steps[currentArrayStep].swapped;
            var sorted = steps[currentArrayStep].sorted;
            var min = steps[currentArrayStep].min;
        } else {
            // default array from contianing numbers from 0 to 14
            arr = [...Array(15).keys()];
        }
        // for each element in the array at the current step
        return array.map((value, id) => {
            var style = "";
            if (isStepAvailable) {
                if (highlight.includes(id)) {
                    style = swapped ? " highlight-error" : " highlight";
                } else if (id === min) {
                    style = " highlight-minflag";
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
            <div className="container">
                    <div className="row">
                        <div className="col-10">
                            <h2>Selection Sort</h2>
                        </div>
                        <AlgorithmPopover 
                            data = {
                                {
                                    algorithm: "Selection Sort",
                                    title : "Selection Sort is an in-place sorting algorithm that selects the smallest element of an unsorted list and places it in the beginning of the unsorted partition",
                                    description : [
                                        "Worst Complexity: O(n^2)",
                                        "In Practice Complexity: O(n^2)",
                                        "Best Complexity: O(n^2)",
                                        "Space Complexity: O(1)",
                                        "Stable: No"
                                    ]
                                }

                            }
                        />
                    </div>
                </div>
            </div>

            <Array1D drawBlocks={drawBlocks} />

            <div className="swap-counter-container">
                <span>
                    Swaps:{" "}
                    {swaps[currentStep - 1] != null
                        ? swaps[currentStep - 1]
                        : 0}
                </span>
            </div>

            <StepTracker></StepTracker>

            <Controls doAlgorithm={doAlgorithm} algorithmUrl={algorithmUrl} />
        </div>
    );
};

export default SelectionSort;

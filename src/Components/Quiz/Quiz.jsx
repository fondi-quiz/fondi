import React, { useRef, useState, useEffect } from 'react';
import './Quiz.css';
import { data as originalData } from '../../assets/data';

const Quiz = () => {

    let [index, setIndex] = useState(0);
    let [question, setQuestion] = useState({});
    let [lock, setLock] = useState(false);
    let [score, setScore] = useState(0);
    let [totalPoints, setTotalPoints] = useState(0);
    let [maxPoints, setMaxPoints] = useState(0);
    let [result, setResult] = useState(false);
    let [lastAnswered, setLastAnswered] = useState(false);
    let [shuffledData, setShuffledData] = useState([]);
    let [startTime, setStartTime] = useState(null);
    let [totalTime, setTotalTime] = useState(0);
    let [elapsedTime, setElapsedTime] = useState(0);

    const optionRefs = useRef([]);
    const timerIntervalRef = useRef(null);

    const shuffleData = (data) => {
        return data.sort(() => Math.random() - 0.5);
    };

    const pickTenQuestions = (data) => {
        const shuffled = shuffleData(data);
        return shuffled.slice(0, 10);
    };

    useEffect(() => {
        const tenRandomQuestions = pickTenQuestions([...originalData]);
        setShuffledData(tenRandomQuestions);
        setQuestion(tenRandomQuestions[0]);

        const totalMaxPoints = tenRandomQuestions.reduce((acc, curr) => acc + parseInt(curr.pike), 0);
        setMaxPoints(totalMaxPoints);

        setStartTime(Date.now());

        timerIntervalRef.current = setInterval(() => {
            setElapsedTime(prevTime => prevTime + 1);
        }, 1000);

        return () => clearInterval(timerIntervalRef.current);
    }, []);

    useEffect(() => {
        if (result) {
            const endTime = Date.now();
            setTotalTime(Math.floor((endTime - startTime) / 1000));
            clearInterval(timerIntervalRef.current);
        }
    }, [result, startTime]);

    const checkAns = (e, ans) => {
        if (lock === false) {
            if (question.ans === ans) {
                e.target.classList.add("correct");
                setScore(prev => prev + 1);
                setTotalPoints(prev => prev + parseInt(question.pike));
            } else {
                e.target.classList.add("wrong");
                optionRefs.current[question.ans - 1].classList.add("correct");
            }

            setLock(true);

            if (index === shuffledData.length - 1) {
                setLastAnswered(true);
            }
        }
    }

    const next = () => {
        if (lock === true) {
            if (lastAnswered) {
                setResult(true);
            } else {
                setIndex(index + 1);
                setQuestion(shuffledData[index + 1]);
                setLock(false);
                optionRefs.current.forEach((ref) => {
                    if (ref) {
                        ref.classList.remove("wrong");
                        ref.classList.remove("correct");
                    }
                });
            }
        }
    }

    const reset = () => {
        const tenRandomQuestions = pickTenQuestions([...originalData]);
        setShuffledData(tenRandomQuestions);
        setIndex(0);
        setQuestion(tenRandomQuestions[0]);
        setScore(0);
        setTotalPoints(0);
        setMaxPoints(tenRandomQuestions.reduce((acc, curr) => acc + parseInt(curr.pike), 0));
        setLock(false);
        setResult(false);
        setLastAnswered(false);
        setStartTime(Date.now());
        setElapsedTime(0);
        setTotalTime(0);
        timerIntervalRef.current = setInterval(() => {
            setElapsedTime(prevTime => prevTime + 1);
        }, 1000);
    }

    const formatTime = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes} minuta e ${seconds} sekonda`;
    };

    return (
        <div className='container'>
            {/* Conditionally render front-table based on result */}
            {!result && (
                <div className="front-table">
                    <div className={`timer ${elapsedTime >= 600 ? 'red-text' : ''}`}>
                        <p>Koha: {formatTime(elapsedTime)}</p>
                    </div>
                    <p>Fondi: {question.fondi}</p>
                    <p>Nr: {question.no}</p>
                    <p>Pikë: {question.pike}</p>
                </div>
            )}

            {result ? (
                <>
                <div className='back-table'>
                    <img src="src\assets\logo.png" style={{ width: '10%', height: 'auto' }} alt="logo" />
                    <h1>Rezultatet</h1>
                    <p className='results'>Gjetur saktë: {score}/{shuffledData.length} Pyetje</p>
                    <p className='results'>Pikët e grumbulluara: {totalPoints} / {maxPoints}</p>
                    <p className='results'>Koha: {formatTime(totalTime)}</p>
                </div>
                    <button onClick={reset}>Reset</button>
                </>
            ) : (
                <>
                    <h2>{index + 1}. {question.question}</h2>
                    <ul>
                        {question.options?.map((option, idx) => (
                            <li
                                key={idx}
                                ref={el => optionRefs.current[idx] = el}
                                onClick={(e) => checkAns(e, idx + 1)}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                    <button onClick={next}>Next</button>
                    <div className='index'><h3>{index + 1}/{shuffledData.length} Pyetje</h3></div>
                </>
            )}
        </div>
    );
}

export default Quiz;

import { useState, useEffect } from 'react'

const CountUp = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTime = null
        const startValue = 0

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime
            const progress = currentTime - startTime

            if (progress < duration) {
                const percentage = progress / duration
                // Ease out quart styling
                const easeOut = 1 - Math.pow(1 - percentage, 4)

                setCount(Math.floor(startValue + (end - startValue) * easeOut))
                requestAnimationFrame(animate)
            } else {
                setCount(end)
            }
        }

        requestAnimationFrame(animate)
    }, [end, duration])

    return <>{count}</>
}

export default CountUp

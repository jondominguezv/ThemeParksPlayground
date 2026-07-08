export type AttractionCardProps = {
    id: string
    name: string
    status: string
    waitTime: number
}

type AttractionCardComponentProps = AttractionCardProps & {
    onRemove: () => void
}

function waitTimeLevel(minutes: number): 'short' | 'moderate' | 'long' {
    if (minutes <= 15) return 'short'
    if (minutes <= 45) return 'moderate'
    return 'long'
}

function AttractionCard({name, status, waitTime, onRemove}: AttractionCardComponentProps) {
    return (
        <div className="attraction-card">
            <h3>{name}</h3>
            <p>Status: {status}</p>
            {status === 'OPERATING' && (
                <p>
                    Standby wait time:{' '}
                    <span className={`wait-badge wait-badge--${waitTimeLevel(waitTime)}`}>
                        {waitTime} min
                    </span>
                </p>
            )}
            <button onClick={onRemove}>Remove</button>
        </div>
    )
}

export default AttractionCard
export type AttractionCardProps = {
    id: string
    name: string
    status: string
    waitTime: number
}

type AttractionCardComponentProps = AttractionCardProps & {
    onRemove: () => void
}

function AttractionCard({name, status, waitTime, onRemove}: AttractionCardComponentProps) {
    return (
        <div className="attraction-card">
            <h3>{name}</h3>
            <p>Status: {status}</p>
            {status === 'OPERATING' && <p>Standby wait time: {waitTime} minutes</p>}
            <button onClick={onRemove}>Remove</button>
        </div>
    )
}

export default AttractionCard
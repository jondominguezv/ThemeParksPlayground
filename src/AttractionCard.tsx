export type AttractionCardProps = {
    name: string
    status: string
    waitTime: number
}

function AttractionCard({name, status, waitTime}: AttractionCardProps) {
    return (
        <div className="attraction-card">
            <h3>{name}</h3>
            <p>Status: {status}</p>
            <p>Standby wait time: {waitTime}</p>
        </div>
    )
}

export default AttractionCard
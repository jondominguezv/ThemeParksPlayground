import type { CatalogEntry } from './catalog'

export type AttractionCardProps = Pick<CatalogEntry, 'id' | 'name' | 'status' | 'waitTime'>

type AttractionCardComponentProps = AttractionCardProps & {
    actionLabel: string
    onAction: () => void
    actionDisabled?: boolean
}

function waitTimeLevel(minutes: number): 'short' | 'moderate' | 'long' {
    if (minutes <= 15) return 'short'
    if (minutes <= 45) return 'moderate'
    return 'long'
}

function AttractionCard({name, status, waitTime, actionLabel, onAction, actionDisabled}: AttractionCardComponentProps) {
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
            <button onClick={onAction} disabled={actionDisabled}>{actionLabel}</button>
        </div>
    )
}

export default AttractionCard
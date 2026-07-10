import type { CatalogEntry } from './catalog'

export type AttractionCardProps = Pick<CatalogEntry, 'id' | 'name' | 'status' | 'waitTime'>

type ActionVariant = 'add' | 'added' | 'remove'

const ACTION_CONFIG: Record<ActionVariant, { label: string; disabled?: boolean }> = {
    add: { label: 'Add to Dashboard' },
    added: { label: 'Added', disabled: true },
    remove: { label: 'Remove' },
}

type AttractionCardComponentProps = AttractionCardProps & {
    variant: ActionVariant
    onAction: () => void
}

function waitTimeLevel(minutes: number): 'short' | 'moderate' | 'long' {
    if (minutes <= 15) return 'short'
    if (minutes <= 45) return 'moderate'
    return 'long'
}

function AttractionCard({name, status, waitTime, variant, onAction}: AttractionCardComponentProps) {
    const { label, disabled } = ACTION_CONFIG[variant]

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
            <button onClick={onAction} disabled={disabled}>{label}</button>
        </div>
    )
}

export default AttractionCard
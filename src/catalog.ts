import { ThemeParks, currentWaitTime, type EntityChildren } from 'themeparks'

// CORS bug for front end request to themeparks API
const themeParksOptions: ConstructorParameters<typeof ThemeParks>[0] = {
    fetch: (input, init) => {
        const headers = { ...init?.headers }
        delete headers['user-agent']
        return fetch(input, { ...init, headers })
    },
}
const tp = new ThemeParks(themeParksOptions)

// Resolved via tp.destinations.list() and pinned rather than matched by name/slug each run.
const ORLANDO_DESTINATIONS = [
    { id: '89db5d43-c434-4097-b71f-f6869f495a22', name: 'Universal Orlando Resort' },
    { id: 'e957da41-3552-4cf6-b636-5babc5cbc4e5', name: 'Walt Disney World Resort' },
    { id: '643e837e-b244-4663-8d3a-148c26ecba9c', name: 'SeaWorld Parks and Resorts Orlando' },
    { id: '7a4adf8d-8c3f-4300-b277-19707e4f8e12', name: 'LEGOLAND Florida' },
] as const

type Destination = (typeof ORLANDO_DESTINATIONS)[number]

// parkId/parkName are optional: buildParkIndex omits them when an attraction's
// parent chain never reaches a PARK entity (e.g. Disney Springs venues).
export type CatalogEntry = {
    id: string
    name: string
    status: string
    waitTime: number
    parkId: string | undefined
    parkName: string | undefined
    destinationId: string
    destinationName: string
}

// EntityChild isn't exported by the SDK directly, only the EntityChildren wrapper.
type EntityChild = NonNullable<EntityChildren['children']>[number]

function buildParkIndex(children: EntityChild[]): Map<string, { parkId: string; parkName: string }> {
    const byId = new Map(children.map((c) => [c.id, c]))
    const index = new Map<string, { parkId: string; parkName: string }>()

    for (const child of children) {
        if (child.entityType !== 'ATTRACTION') continue

        let current: EntityChild | undefined = child
        while (current && current.entityType !== 'PARK') {
            current = current.parentId ? byId.get(current.parentId) : undefined
        }

        if (current) {
            index.set(child.id, { parkId: current.id, parkName: current.name })
        }
    }

    return index
}

async function loadDestinationCatalog(destination: Destination): Promise<CatalogEntry[]> {
    const children: EntityChild[] = []
    for await (const child of tp.entity(destination.id).walk()) {
        children.push(child)
    }
    const parkIndex = buildParkIndex(children)

    const live = await tp.entity(destination.id).live()
    return (live.liveData ?? [])
        .filter((entry) => entry.entityType === 'ATTRACTION')
        .map((entry) => {
            const park = parkIndex.get(entry.id)
            return {
                id: entry.id,
                name: entry.name,
                status: entry.status ?? 'UNKNOWN',
                waitTime: currentWaitTime(entry) ?? 0,
                parkId: park?.parkId,
                parkName: park?.parkName,
                destinationId: destination.id,
                destinationName: destination.name,
            }
        })
}

export async function loadCatalog(): Promise<CatalogEntry[]> {
    const results = await Promise.allSettled(
        ORLANDO_DESTINATIONS.map(loadDestinationCatalog)
    )

    return results.flatMap((result, i) => {
        if (result.status === 'rejected') {
            console.error(`Failed to load ${ORLANDO_DESTINATIONS[i].name}:`, result.reason)
            return []
        }
        return result.value
    })
}

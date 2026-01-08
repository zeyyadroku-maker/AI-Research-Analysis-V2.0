import { NextRequest, NextResponse } from 'next/server'

// Mock data for fallback
const MOCK_DATA = {
    nodes: [
        { id: 'main', label: 'This Paper', r: 40, color: '#4F46E5', url: '#', x: 400, y: 300 },
        { id: 'ref1', label: 'Smith et al. (2019)', r: 20, color: '#10B981', x: 258, y: 158, url: '#' },
        { id: 'ref2', label: 'Johnson (2020)', r: 20, color: '#10B981', x: 258, y: 441, url: '#' },
        { id: 'ref3', label: 'Williams (2018)', r: 20, color: '#10B981', x: 200, y: 300, url: '#' },
        { id: 'cit1', label: 'Brown et al. (2024)', r: 25, color: '#3B82F6', x: 541, y: 158, url: '#' },
        { id: 'cit2', label: 'Davis (2023)', r: 25, color: '#3B82F6', x: 541, y: 441, url: '#' }
    ],
    links: [
        { source: 'reference', target: 'main', type: 'reference' }, // simplified for mock
        { source: 'main', target: 'citation', type: 'citation' }
    ]
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, doi } = body
        console.log('Citation API Request:', { title, doi })

        if (!title && !doi) {
            return NextResponse.json(
                { error: 'Title or DOI is required' },
                { status: 400 }
            )
        }

        // Helper for timeout fetch
        const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 5000) => {
            const controller = new AbortController()
            const id = setTimeout(() => controller.abort(), timeout)
            try {
                const response = await fetch(url, { ...options, signal: controller.signal })
                clearTimeout(id)
                return response
            } catch (error) {
                clearTimeout(id)
                throw error
            }
        }

        // 1. Search for the paper to get its ID
        const query = doi || title
        const searchUrl = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=1`
        console.log('Searching Semantic Scholar:', searchUrl)

        const searchRes = await fetchWithTimeout(searchUrl)
        if (!searchRes.ok) {
            throw new Error(`Semantic Scholar Search API error: ${searchRes.statusText}`)
        }

        const searchData = await searchRes.json()

        if (!searchData.data || searchData.data.length === 0) {
            console.log('Paper not found, returning mock data')
            return NextResponse.json({ ...MOCK_DATA, isMock: true })
        }

        const paperId = searchData.data[0].paperId
        console.log('Found Paper ID:', paperId)

        // 2. Fetch details (citations and references)
        const detailsUrl = `https://api.semanticscholar.org/graph/v1/paper/${paperId}?fields=title,authors,year,url,citations.title,citations.authors,citations.year,citations.url,references.title,references.authors,references.year,references.url&limit=10`
        console.log('Fetching Details:', detailsUrl)

        const detailsRes = await fetchWithTimeout(detailsUrl)
        if (!detailsRes.ok) {
            throw new Error(`Semantic Scholar Details API error: ${detailsRes.statusText}`)
        }

        const paperDetails = await detailsRes.json()

        // 3. Transform data for the graph
        const centerNode = {
            id: 'main',
            label: 'This Paper',
            r: 40,
            color: '#4F46E5',
            url: paperDetails.url || '#',
            x: 400,
            y: 300
        }

        const nodes = [centerNode]
        const links: any[] = []

        const addNodes = (list: any[], type: 'citation' | 'reference', color: string, startAngle: number, endAngle: number) => {
            if (!list) return

            const count = Math.min(list.length, 5)
            const angleStep = (endAngle - startAngle) / count

            list.slice(0, count).forEach((item: any, i: number) => {
                const angle = startAngle + (i * angleStep)
                const radius = 200
                const x = 400 + radius * Math.cos(angle)
                const y = 300 + radius * Math.sin(angle)

                const nodeId = `${type}-${i}`

                nodes.push({
                    id: nodeId,
                    label: item.title ? (item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title) : 'Unknown',
                    r: type === 'citation' ? 25 : 20,
                    color: color,
                    x: x,
                    y: y,
                    url: item.url || '#'
                })

                links.push({
                    source: type === 'citation' ? nodeId : 'main',
                    target: type === 'citation' ? 'main' : nodeId,
                    type: type
                })
            })
        }

        addNodes(paperDetails.references, 'reference', '#10B981', Math.PI * 0.75, Math.PI * 2.25)
        addNodes(paperDetails.citations, 'citation', '#3B82F6', -Math.PI * 0.25, Math.PI * 0.75)

        return NextResponse.json({ nodes, links, isMock: false })

    } catch (error) {
        console.error('Citation API Fatal Error (Returning Mock Data):', error)
        // Return mock data on error to prevent UI crash
        return NextResponse.json({ ...MOCK_DATA, isMock: true })
    }
}

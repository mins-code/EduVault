import { useRef, useEffect, useState } from 'react'
import ForceGraph3D from 'react-force-graph-3d'
import * as THREE from 'three'

export default function SkillConstellation({ graphData }) {
    const fgRef = useRef()
    const [dimensions, setDimensions] = useState({ width: 0, height: 600 })

    useEffect(() => {
        // Auto-rotate the graph
        if (fgRef.current) {
            fgRef.current.cameraPosition({ z: 300 })

            // Gentle auto-rotation
            let angle = 0
            const rotationInterval = setInterval(() => {
                angle += 0.003
                const distance = 300
                fgRef.current.cameraPosition({
                    x: distance * Math.sin(angle),
                    z: distance * Math.cos(angle)
                })
            }, 50)

            return () => clearInterval(rotationInterval)
        }
    }, [])

    useEffect(() => {
        // Set dimensions based on container
        const updateDimensions = () => {
            const container = document.getElementById('constellation-container')
            if (container) {
                setDimensions({
                    width: container.offsetWidth,
                    height: 600
                })
            }
        }
        updateDimensions()
        window.addEventListener('resize', updateDimensions)
        return () => window.removeEventListener('resize', updateDimensions)
    }, [])

    const getNodeColor = (node) => {
        switch (node.group) {
            case 'user':
                return '#FFD700' // Gold
            case 'skill':
                return '#06b6d4' // Cyan
            case 'project':
                return '#a855f7' // Purple
            default:
                return '#64748b'
        }
    }

    // Create glowing 3D sphere nodes
    const nodeThreeObject = (node) => {
        const color = getNodeColor(node)
        const material = new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            opacity: 0.9,
            emissive: color, // GLOW EFFECT
            emissiveIntensity: 0.6
        })
        const geometry = new THREE.SphereGeometry(node.val || 5)
        return new THREE.Mesh(geometry, material)
    }

    const handleNodeClick = (node) => {
        if (node.group === 'project' && node.githubLink) {
            window.open(node.githubLink, '_blank')
        }
    }

    if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
        return (
            <div className="flex items-center justify-center h-[600px] text-slate-500">
                <div className="text-center">
                    <div className="text-6xl mb-4">🌌</div>
                    <p className="text-lg">No constellation data available</p>
                    <p className="text-sm mt-2">Add skills and projects to see your galaxy</p>
                </div>
            </div>
        )
    }

    return (
        <div id="constellation-container" className="relative w-full h-[600px]">
            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                width={dimensions.width}
                height={dimensions.height}
                backgroundColor="rgba(0,0,0,0)"
                nodeLabel={(node) => `
                    <div style="
                        background: rgba(15, 23, 42, 0.95);
                        padding: 8px 12px;
                        border-radius: 8px;
                        border: 1px solid ${getNodeColor(node)};
                        color: white;
                        font-family: 'Inter', sans-serif;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    ">
                        <div style="font-weight: 600; color: ${getNodeColor(node)};">
                            ${node.name}
                        </div>
                        ${node.description ? `<div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">${node.description}</div>` : ''}
                        ${node.group === 'project' ? '<div style="font-size: 11px; color: #06b6d4; margin-top: 4px;">Click to view on GitHub</div>' : ''}
                    </div>
                `}
                nodeThreeObject={nodeThreeObject}
                nodeOpacity={1}
                linkColor={() => 'rgba(6, 182, 212, 0.4)'}
                linkWidth={1}
                linkOpacity={0.6}
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleSpeed={0.005}
                onNodeClick={handleNodeClick}
                enableNodeDrag={false}
                enableNavigationControls={true}
                showNavInfo={false}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
            />
        </div>
    )
}

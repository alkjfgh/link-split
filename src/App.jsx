import { useState } from 'react'
import './App.css'

function App() {
  const [links, setLinks] = useState([])
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const text = event.target.result
      const fileName = file.name
      
      const sections = []
      let currentSection = {
        title: '',
        items: []
      }
      
      const lines = text.split('\n')
      lines.forEach((line, index) => {
        const trimmedLine = line.trim()
        
        if (trimmedLine.startsWith('----')) {
          if (index > 0) {
            const prevLine = lines[index - 1].trim()
            if (prevLine && !prevLine.includes('http') && !prevLine.includes('Link:')) {
              if (currentSection.title) {
                sections.push({...currentSection})
              }
              currentSection = {
                title: prevLine,
                items: []
              }
            }
          }
        } else if (trimmedLine && !trimmedLine.startsWith('----')) {
          if (trimmedLine.includes('.var')) {
            currentSection.items.push({
              name: trimmedLine.trim(),
              url: null
            })
          } else if (trimmedLine.includes('http') || trimmedLine.includes('Link:')) {
            let name, url

            if (trimmedLine.includes('Link:')) {
              const parts = trimmedLine.split('Link:')
              name = parts[0].split('By:')[0].trim()
              url = parts[1].trim()
            } else {
              const parts = trimmedLine.split(/[\s-]+/)
              name = parts[0].trim()
              url = parts.find(part => part.startsWith('http'))
            }

            if (name && url) {
              currentSection.items.push({
                name: name.trim(),
                url: url.trim()
              })
            }
          }
        }
      })
      
      if (currentSection.title && currentSection.items.length > 0) {
        sections.push(currentSection)
      }
      
      setLinks([{ fileName }, ...sections])
    }
    
    reader.readAsText(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!isDragging) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX
    const y = e.clientY
    
    if (
      x <= rect.left ||
      x >= rect.right ||
      y <= rect.top ||
      y >= rect.bottom
    ) {
      setIsDragging(false)
    }
  }

  return (
    <div 
      onDrop={handleDrop} 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        min-h-screen w-full overflow-y-auto relative
        ${isDragging 
          ? 'bg-blue-100 border-2 border-dashed border-blue-400' 
          : 'bg-gray-100'
        }
        p-8 transition-colors duration-200
      `}
    >
      {isDragging && (
        <div className="fixed inset-0 flex items-center justify-center bg-blue-100/50">
          <p className="text-2xl text-blue-500 font-semibold">파일을 여기에 드롭하세요</p>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Link Split</h1>
        
        {links.map((section, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md p-6 mb-4 max-w-2xl w-full">
            {section.fileName ? (
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">{section.fileName}</h2>
            ) : (
              <>
                <h3 className="text-xl font-medium text-gray-700 mb-3">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-center justify-between">
                      <span className="text-gray-600">{item.name}</span>
                      {item.url ? (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
                        >
                          Download
                        </a>
                      ) : (
                        <span className="px-4 py-2 bg-gray-300 text-gray-600 rounded">
                          Hub에서 다운로드
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App

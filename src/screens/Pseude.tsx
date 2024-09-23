import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"

export default function GameScreen() {
  return (
    <div className="flex flex-col h-screen bg-yellow-50">
      {/* Target Actor Section */}
      <div className="bg-black text-yellow-300 p-4 shadow-md">
        <h2 className="text-xl font-bold mb-2">Target Actor</h2>
        <div className="flex items-center space-x-4">
          <img
            src="/placeholder.svg?height=80&width=80"
            alt="Target Actor"
            className="w-20 h-20 rounded-full object-cover border-2 border-yellow-300"
          />
          <span className="text-lg">Leonardo DiCaprio</span>
        </div>
      </div>

      {/* Current Selection Section */}
      <Card className="m-4 bg-yellow-100 shadow-lg">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">Starting Actor</h3>
          <div className="flex items-center space-x-4">
            <img
              src="/placeholder.svg?height=100&width=100"
              alt="Starting Actor"
              className="w-24 h-24 rounded-lg object-cover shadow-md"
            />
            <span className="text-xl">Tom Hanks</span>
          </div>
        </CardContent>
      </Card>

      {/* Credits/Actors List */}
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <Card key={item} className="bg-yellow-200 hover:bg-yellow-300 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center space-x-4">
                <img
                  src="/placeholder.svg?height=80&width=60"
                  alt={`Movie ${item}`}
                  className="w-15 h-20 object-cover rounded shadow-sm"
                />
                <div>
                  <h4 className="font-semibold">Movie Title {item}</h4>
                  <p className="text-sm text-gray-600">Release Date: 2023</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
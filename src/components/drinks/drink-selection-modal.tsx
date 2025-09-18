'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { getDrinksByCategory, getDrinkLabel, getDrinkPoints } from '@/lib/utils/drinks'

interface DrinkSelectionModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSelectDrink: (drinkType: string) => void
  selectedDrink?: string
}

export default function DrinkSelectionModal({ 
  isOpen, 
  onOpenChange, 
  onSelectDrink,
  selectedDrink
}: DrinkSelectionModalProps) {
  const [tempSelection, setTempSelection] = useState(selectedDrink || '')
  const categories = getDrinksByCategory()

  const handleConfirm = () => {
    if (tempSelection) {
      onSelectDrink(tempSelection)
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setTempSelection(selectedDrink || '')
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Izberi pijačo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <RadioGroup value={tempSelection} onValueChange={setTempSelection}>
            {categories.map((category) => (
              <div key={category.name} className="space-y-3">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{category.emoji}</span>
                  <h3 className="font-bold text-lg">
                    {category.name} ({category.description})
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 ml-6">
                  {category.drinks.map((drink) => (
                    <div key={drink.type} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <RadioGroupItem 
                        value={drink.type} 
                        id={drink.type}
                        className="scale-125"
                      />
                      <Label 
                        htmlFor={drink.type} 
                        className="cursor-pointer flex-1 text-base font-medium"
                      >
                        {drink.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={handleCancel} size="lg">
            Prekliči
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!tempSelection}
            size="lg"
            className="min-w-32"
          >
            Potrdi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
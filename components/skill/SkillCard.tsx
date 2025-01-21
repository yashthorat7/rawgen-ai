'use client';

import { motion } from 'framer-motion';
import { PencilIcon, Trash2Icon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { EditSkillDialog } from './EditSkillDialog';
import { UpdateCardIcon } from '../ui/UpdateCardIcon';

interface SkillCardProps {
  category: string;
  skills?: string[];
  onEdit?: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
}

const distributeSkills = (skills: string[]) => {
  const total = skills.length;
  if (total === 0) return [];

  // Predefined patterns for 1-16 items
  const patterns: { [key: number]: number[] } = {
    1: [1],
    2: [2],
    3: [1, 2],
    4: [2, 2],
    5: [2, 3],
    6: [3, 3],
    7: [4, 3],
    8: [4, 4],
    9: [3, 3, 3],
    10: [3, 4, 3],
    11: [3, 4, 4],
    12: [4, 4, 4],
    13: [2, 4, 4, 3],
    14: [3, 4, 4, 3],
    15: [3, 4, 4, 4],
    16: [4, 4, 4, 4]
  };

  // If we have a predefined pattern, use it
  if (patterns[total]) {
    return patterns[total];
  }

  // For more than 16 items, use a 4-based distribution
  const distribution = [];
  let remaining = total;

  while (remaining > 0) {
    if (remaining >= 4) {
      distribution.push(4);
      remaining -= 4;
    } else {
      distribution.push(remaining);
      remaining = 0;
    }
  }

  return distribution;
};

const getRandomColor = () => {
  const colors = [
    'rgb(239, 68, 68)',    // red
    'rgb(59, 130, 246)',   // blue
    'rgb(16, 185, 129)',   // green
    'rgb(245, 158, 11)',   // amber
    'rgb(139, 92, 246)',   // purple
    'rgb(236, 72, 153)',   // pink
    'rgb(14, 165, 233)',   // sky
    'rgb(168, 85, 247)',   // violet
    'rgb(251, 146, 60)',   // orange
    'rgb(20, 184, 166)',   // teal
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const SkillCard = ({ category, skills = [], onEdit, onDelete, onUpdate }: SkillCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredPosition, setHoveredPosition] = useState<{ row: number, col: number } | null>(null);
  const [hoverColor, setHoverColor] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const shuffledSkills = useMemo(() => 
    [...skills].sort(() => Math.random() - 0.5), 
    [skills]
  );

  const distribution = useMemo(() => 
    distributeSkills(shuffledSkills), 
    [shuffledSkills]
  );

  // Calculate offset for neighboring items with reduced range
  const getOffset = (currentRow: number, currentCol: number) => {
    if (!hoveredPosition) return { x: 0, y: 0 };
    
    const rowDiff = currentRow - hoveredPosition.row;
    const colDiff = currentCol - hoveredPosition.col;
    
    // If it's the same item, no offset
    if (rowDiff === 0 && colDiff === 0) return { x: 0, y: 0 };
    
    // Calculate distance from hovered item
    const distance = Math.sqrt(rowDiff * rowDiff + colDiff * colDiff);
    
    // Only affect immediate neighbors (distance <= 1.5)
    if (distance > 1.5) return { x: 0, y: 0 };
    
    // Calculate reduced offset with distance falloff
    const strength = 1 - (distance / 1.5); // 1 for immediate neighbors, decreasing with distance
    const xOffset = colDiff * 12 * strength; // reduced from 20 to 12
    const yOffset = rowDiff * 6 * strength;  // reduced from 10 to 6
    
    return { x: xOffset, y: yOffset };
  };

  let currentIndex = 0;

  return (
    <>
      <div className="w-full h-auto sm:h-[225px] flex flex-col border-2 border-transparent rounded-lg group">
        {/* Skills Area */}
        <div className="flex-1 p-2 sm:p-2">
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            {distribution.map((rowCount, rowIndex) => {
              const rowSkills = shuffledSkills.slice(currentIndex, currentIndex + rowCount);
              const startIndex = currentIndex;
              currentIndex += rowCount;
              
              return (
                <motion.div 
                  key={rowIndex} 
                  className="flex justify-center"
                  layout
                >
                  {rowSkills.map((skill, colIndex) => {
                    const isHovered = hoveredPosition?.row === rowIndex && hoveredPosition?.col === colIndex;
                    const offset = getOffset(rowIndex, colIndex);
                    
                    return (
                      <motion.div
                        key={colIndex}
                        className={`px-3 py-2 bg-white shadow-[0_4px_8px_rgba(0,0,100,0.08)] rounded-md text-base whitespace-nowrap cursor-default mx-1 ${
                          isHovered ? 'z-10' : 'z-0'
                        }`}
                        layout
                        onHoverStart={() => {
                          setHoveredPosition({ row: rowIndex, col: colIndex });
                          setHoverColor(getRandomColor());
                        }}
                        onHoverEnd={() => {
                          setHoveredPosition(null);
                          setHoverColor('');
                        }}
                        animate={{
                          scale: isHovered ? 1.3 : 1,
                          color: isHovered ? 'white' : 'black',
                          backgroundColor: isHovered ? hoverColor : 'white',
                          x: offset.x,
                          y: offset.y,
                          zIndex: isHovered ? 10 : 0,
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          layout: {
                            type: "spring",
                            stiffness: 200,
                            damping: 25
                          }
                        }}
                      >
                        {skill}
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Category Name */}
        <div 
          className="flex justify-center items-center relative mb-0 w-full px-3 py-1"
        >
          <div className="text-black text-xl title font-bold">
            {category}
          </div>
          <div className="absolute right-0 bottom-1">
            <UpdateCardIcon
              onEdit={() => setIsEditDialogOpen(true)}
              onDelete={onDelete}
              position="bottom-right"
            />
          </div>
        </div>
      </div>

      <EditSkillDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        category={category}
        initialSkills={skills}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default SkillCard; 
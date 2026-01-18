
import React from 'react';

interface AvatarProps {
    photo: string;
    name: string;
    className?: string;
    textClassName?: string;
}

const Avatar: React.FC<AvatarProps> = ({ photo, name, className, textClassName }) => {
    // FIX: Adicionado check para 'data:' para suportar imagens em Base64 (uploads locais)
    const isUrl = photo.startsWith('blob:') || photo.startsWith('http') || photo.startsWith('data:');
    
    // Basic emoji check - will not match all, but good for this case.
    const isEmoji = !isUrl && /\p{Emoji}/u.test(photo);

    if (isUrl) {
        return (
            <img 
                src={photo} 
                alt={name} 
                className={`w-full h-full object-cover ${className}`} 
            />
        );
    }
    
    // For emojis or initials, we need a container.
    return (
        <div className={`w-full h-full flex items-center justify-center ${className} bg-gray-200 dark:bg-gray-700 text-gray-500`}>
             {isEmoji ? (
                 <span role="img" aria-label={name} className={textClassName}>{photo}</span>
             ) : (
                <span className={textClassName}>{name.charAt(0).toUpperCase()}</span>
             )}
        </div>
    );
};

export default Avatar;

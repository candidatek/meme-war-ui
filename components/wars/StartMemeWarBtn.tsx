import { useRouter } from 'next/navigation';

interface StartMemeWarButtonProps {
  onClick?: () => void; // Optional behavior
  text?: string; // Customizable button text
  className?: string; // Additional styles
}

const StartMemeWarButton: React.FC<StartMemeWarButtonProps> = ({
  onClick,
  text = '> start a meme war',
  className = '',
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) onClick();
    router.push('/create-war');
  };

  return (
    <div
      onClick={handleClick}
      className={`text-2xl mb-3 font-bold underline cursor-pointer text-center ${className}`}
    >
      {text}
    </div>
  );
};

export default StartMemeWarButton;
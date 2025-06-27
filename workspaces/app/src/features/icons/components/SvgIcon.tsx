import ArrowBack from '@mui/icons-material/ArrowBack';
import Close from '@mui/icons-material/Close';
import Favorite from '@mui/icons-material/Favorite';
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import NavigateNext from '@mui/icons-material/NavigateNext';
import Search from '@mui/icons-material/Search';

const IconComponents = {
  ArrowBack,
  Close,
  Favorite,
  FavoriteBorder,
  NavigateNext,
  Search,
} as const;

type Props = {
  color: string;
  height: number;
  type: keyof typeof IconComponents;
  width: number;
};

export const SvgIcon: React.FC<Props> = ({ color, height, type, width }) => {
  const Icon = IconComponents[type];
  return <Icon style={{ color, height, width }} />;
};

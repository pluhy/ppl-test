import Link from 'next/link'
import { categories } from '../config/config';

export const getStaticProps = () => {
  return {
    props: {
      categories
    }
  }
};

const CategoryList = ({categories}) => {
  return (
    <ul>
      {Object.keys(categories).map(categoryId => (
        <li key={categoryId}>
          <Link href={`/category/${categoryId}`}>
            <a>{categories[categoryId]}</a>
          </Link>
        </li>
      ))}
    </ul>
    
  )
};

const Index = ({categories}) => {
  return (
    <>
      <h1>Testové otázky - PPL</h1>
      <CategoryList categories={categories} />
    </>
  );
};

export default Index;

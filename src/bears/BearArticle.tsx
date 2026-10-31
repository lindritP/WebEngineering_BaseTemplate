import type { ReactElement } from 'react';
import ToggleComments from '../layout/comments/ToggleComments.tsx';
import type { BearType } from '../types.ts';
import BearHabitat from './BearHabitat.tsx';
import BearTypesTable from './BearTypesTable.tsx';
import MoreBears from './MoreBears.tsx';
import Highlight from '../search/Highlight.tsx';

const bearTypes: BearType[] = [
  {
    type: 'Wild',
    coat: 'Brown or black',
    adultSize: '1.4 to 2.8 meters',
    habitat: 'Woods and forests',
    lifespan: '25 to 28 years',
    diet: 'Fish, meat, plants',
  },
  {
    type: 'Urban',
    coat: 'North Face',
    adultSize: '18 to 22',
    habitat: 'Condos and coffee shops',
    lifespan: '20 to 32 years',
    diet: 'Starbucks, sushi',
  },
];

interface BearArticleProps {
  searchTerm: string;
}

export default function BearArticle({
  searchTerm,
}: BearArticleProps): ReactElement {
  return (
    <article>
      <h2 className="heading-lg">
        <Highlight text="The trouble with Bears" query={searchTerm} />
      </h2>
      <p>
        <Highlight text="By Evan Wild" query={searchTerm} />
      </p>
      <p>
        <Highlight
          text="Tall, lumbering, angry, dangerous. The real live bears of this world are proud, independent creatures, self-serving and always on the hunt for food."
          query={searchTerm}
        />
      </p>

      <h3 className="heading-md">
        <Highlight text="Types of bear" query={searchTerm} />
      </h3>
      <BearTypesTable bearTypes={bearTypes} searchTerm={searchTerm} />

      <h3 className="heading-md">
        <Highlight text="Habitats and Eating habits" query={searchTerm} />
      </h3>
      <BearHabitat
        description="Wild bears eat a variety of meat, fish, fruit, nuts, and other natually growing ingredients..."
        imageSrc="/media/wild-bear.jpg"
        imageAlt="Wild bear in forest"
        searchTerm={searchTerm}
      />
      <BearHabitat
        description="Urban (gentrified) bears on the other hand have largely abandoned the old ways..."
        imageSrc="/media/urban-bear.jpg"
        imageAlt="Urban bear near buildings"
        searchTerm={searchTerm}
      />

      <h3 className="heading-md">
        <Highlight text="Mating rituals" query={searchTerm} />
      </h3>
      <p>
        <Highlight
          text="Bears are romantic creatures by nature..."
          query={searchTerm}
        />
      </p>
      <audio controls>
        <source src="/media/bear.mp3" type="audio/mp3" />
        <source src="/media/bear.ogg" type="audio/ogg" />
        <p>
          It looks like your browser doesn&apos;t support HTML5 audio players.
        </p>
      </audio>

      <aside>
        <h3 className="heading-md">
          <Highlight text="About the author" query={searchTerm} />
        </h3>
        <p>
          <Highlight
            text="Evan Wild is an unemployed plumber from Doncaster..."
            query={searchTerm}
          />
        </p>
      </aside>

      <ToggleComments />

      <MoreBears searchTerm={searchTerm} />
    </article>
  );
}

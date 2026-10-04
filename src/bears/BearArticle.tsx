import type { ReactElement } from 'react';
import ToggleComments from '../layout/comments/ToggleComments.tsx';
import type { BearType } from '../types.ts';
import BearHabitat from './BearHabitat.tsx';
import BearTypesTable from './BearTypesTable.tsx';
import { sampleBears } from './sampleBears.ts';
import BearCard from './BearCard.tsx';

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

export default function BearArticle(): ReactElement {
  return (
    <article>
      <h2 className="heading-lg">The trouble with Bears</h2>
      <p>By Evan Wild</p>
      <p>
        Tall, lumbering, angry, dangerous. The real live bears of this world are
        proud, independent creatures, self-serving and always on the hunt for
        food.
      </p>

      <h3 className="heading-md">Types of bear</h3>
      <BearTypesTable bearTypes={bearTypes} />

      <h3 className="heading-md">Habitats and Eating habits</h3>
      <BearHabitat
        description="Wild bears eat a variety of meat, fish, fruit, nuts, and other natually growing ingredients..."
        imageSrc="/media/wild-bear.jpg"
        imageAlt="Wild bear in forest"
      />
      <BearHabitat
        description="Urban (gentrified) bears on the other hand have largely abandoned the old ways..."
        imageSrc="/media/urban-bear.jpg"
        imageAlt="Urban bear near buildings"
      />

      <h3 className="heading-md">Mating rituals</h3>
      <p>Bears are romantic creatures by nature...</p>
      <audio controls>
        <source src="/media/bear.mp3" type="audio/mp3" />
        <source src="/media/bear.ogg" type="audio/ogg" />
        <p>
          It looks like your browser doesn&apos;t support HTML5 audio players.
        </p>
      </audio>

      <aside>
        <h3 className="heading-md">About the author</h3>
        <p>Evan Wild is an unemployed plumber from Doncaster...</p>
      </aside>

      <ToggleComments />

      <section className="more_bears">
        <h3 className="heading-md">More Bears</h3>
        {sampleBears.map((bear) => (
          <BearCard key={bear.binomial} bear={bear} />
        ))}
      </section>
    </article>
  );
}

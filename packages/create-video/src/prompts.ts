import type {Choice, Options, PromptObject} from 'prompts';
import prompts from 'prompts';

export type Question<V extends string = string> = PromptObject<V> & {
	optionsPerPage?: number;
};
export type NamelessQuestion = Omit<Question<'value'>, 'name' | 'type'>;
type PromptOptions = {nonInteractiveHelp?: string} & Options;

export default function prompt(
	questions: Question,
	{nonInteractiveHelp, ...options}: PromptOptions = {},
) {
	return prompts([questions], {
		onCancel() {
			throw new Error();
		},
		...options,
	});
}

export async function selectAsync(
	questions: NamelessQuestion,
): Promise<unknown> {
	const {value} = await prompt({
		limit: 11,
		...questions,
		// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
		// @ts-ignore
		onRender(this: {
			cursor: number;
			firstRender: boolean;
			choices: (Omit<prompts.Choice, 'disable'> & {disabled?: boolean})[];
			value: string;
			render: () => void;
			moveCursor: (n: number) => void;
			fire: () => void;
			up: () => void;
			down: () => void;
			bell: () => void;
			next: () => void;
		}) {
			if (this.firstRender) {
				// Ensure the initial state isn't on a disabled item.
				while ((this.choices[this.cursor] as Choice).disabled) {
					this.cursor++;
					if (this.cursor > this.choices.length - 1) break;
				}

				this.fire();
				// Without this, the value will be `0` instead of a string.

				this.value = (this.choices[this.cursor] || {}).value;

				// Support up arrow and `k` key -- no looping
				this.up = () => {
					let next = this.cursor;

					while (true) {
						if (next <= 0) break;
						next--;
						if (!(this.choices[next] as Choice).disabled) break;
					}

					if (
						!(this.choices[next] as Choice).disabled &&
						next !== this.cursor
					) {
						this.moveCursor(next);
						this.render();
					} else {
						this.bell();
					}
				};

				// Support down arrow and `j` key -- no looping
				this.down = () => {
					let next = this.cursor;

					while (true) {
						if (next >= this.choices.length - 1) break;
						next++;
						if (!(this.choices[next] as Choice).disabled) break;
					}

					if (
						!(this.choices[next] as Choice).disabled &&
						next !== this.cursor
					) {
						this.moveCursor(next);
						this.render();
					} else {
						this.bell();
					}
				};

				// Support tab -- looping
				this.next = () => {
					let next = this.cursor;
					let i = 0;
					while (i < this.choices.length) {
						i++;
						next = (next + 1) % this.choices.length;
						if (!(this.choices[next] as Choice).disabled) break;
					}

					if ((this.choices[next] as Choice).disabled) {
						// unexpected
						this.bell();
					} else {
						this.moveCursor(next);
						this.render();
					}
				};
			}
		},
		name: 'value',
		type: 'select',
	});
	return value ?? null;
}

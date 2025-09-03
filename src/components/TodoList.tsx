import { memo } from 'react';
import { Todo } from '../types/Todo';
import { TodoItem } from './TodoItem';

type Props = {
  todos: Todo[];
  tempTodo: Todo | null;
  onTodoDelete: (todoId: number) => Promise<boolean>;
  onTodoSetChecked: (todoId: number, isChecked: boolean) => Promise<void>;
  onTodoTitleChange: (todoId: number, newTitle: string) => Promise<boolean>;
};

export const TodoList = memo<Props>(
  ({ todos, tempTodo, onTodoDelete, onTodoSetChecked, onTodoTitleChange }) => {
    return (
      <section className="todoapp__main" data-cy="TodoList">
        {todos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onTodoDelete={onTodoDelete}
            onTodoSetChecked={onTodoSetChecked}
            onTodoTitleChange={onTodoTitleChange}
          />
        ))}

        {tempTodo && (
          <TodoItem
            key={tempTodo.id}
            todo={tempTodo}
            onTodoDelete={onTodoDelete}
            onTodoSetChecked={onTodoSetChecked}
            onTodoTitleChange={onTodoTitleChange}
          />
        )}
      </section>
    );
  },
);

TodoList.displayName = 'TodoList';

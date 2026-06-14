namespace BookCalls;

@doc("Единственный заранее заданный владелец календаря.")
model Owner {
  @doc("Фиксированный идентификатор единственного владельца.")
  id: "default";

  displayName: string;
}

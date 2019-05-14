function SortPath(id: Cardinal; len: PInteger): WordBool;
var
  e: IInterface;
begin
  Result := False;
  try
    if not Supports(Resolve(id), IwbElement, element) then
      raise Exception.create('Error: ');
    
  except
    on x: Exception do ExceptionHandler(x);
  end;
end;
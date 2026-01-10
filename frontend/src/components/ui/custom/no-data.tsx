export const NoData = ({ message }: { message?: string }) => {
  return (
    <div className="w-full h-[150px] !my-10  flex justify-center items-center">
      <div className="flex flex-col items-center">
        <img
          src={"/nodata.avif"}
          alt="no data"
          height={"150px"}
          width={"150px"}
        />
        <div>{message ? message : "Nothing To Display!"}</div>
      </div>
    </div>
  );
};

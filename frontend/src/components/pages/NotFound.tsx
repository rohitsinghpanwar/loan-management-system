import notFound from "../../assets/404-error.mp4"

function NotFound() {
  return (
    <div className="border border-black flex items-center justify-center min-h-screen">
      <div className="border border-outline w-100 rounded-xl p-5 bg-[#FCFCF9] shadow-md">
 <video src={notFound} muted autoPlay loop></video>
        <h1 className="font-bold text-lg">The requested URL was not found! You may have followed a wrong Link! </h1>
    </div>
      </div>
       
  )
}

export default NotFound